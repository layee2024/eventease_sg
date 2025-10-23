import { ref, onUnmounted } from "vue"
import { supabase } from "@/utils/supabase"
import { toast } from "vue-sonner"

export const newInviteModalOpen = ref(false)
export const newInvites = ref([])
export const newFriendRequests = ref([])

let channel = null
let currentUserId = null

async function enrichInvites(invites) {
  if (!invites?.length) return []
  const eventIds = [...new Set(invites.map(i => i.event_id))]
  const fromIds  = [...new Set(invites.map(i => i.from))]

  const [{ data: events }, { data: users }] = await Promise.all([
    supabase.from("events").select("id,title").in("id", eventIds),
    supabase.from("user_preferences").select("id,name,profile_picture").in("id", fromIds),
  ])

  const eventMap = new Map((events || []).map(e => [e.id, e]))
  const userMap  = new Map((users  || []).map(u => [u.id, u]))

  return invites.map(i => {
    const inviter = userMap.get(i.from)
    return {
      ...i,
      eventTitle: eventMap.get(i.event_id)?.title || "Unknown Event",
      inviterName: inviter?.name || "Someone",
      inviterAvatar: inviter?.profile_picture || null,
    }
  })
}

async function enrichFriendRequests(userIds) {
  if (!userIds?.length) return []
  const { data, error } = await supabase
    .from("user_preferences")
    .select("id,name,email,profile_picture")
    .in("id", userIds)
  if (error) return []
  return data || []
}

async function loadExistingNotifications(userId) {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("invite_requests, friend_requests")
    .eq("id", userId)
    .single()
  if (error) return

  if (data?.invite_requests?.length) {
    newInvites.value = await enrichInvites(data.invite_requests)
  }

  if (data?.friend_requests?.length) {
    newFriendRequests.value = await enrichFriendRequests(data.friend_requests)
  }

  if (newInvites.value.length || newFriendRequests.value.length)
    newInviteModalOpen.value = true
}

function diffAddedInvites(oldArr = [], newArr = []) {
  const key = (x) => `${x.event_id || ""}_${x.from || ""}`
  const oldSet = new Set(oldArr.map(key))
  return newArr.filter((x) => !oldSet.has(key(x)))
}

function diffAddedRequests(oldArr = [], newArr = []) {
  const oldSet = new Set(oldArr.map(String))
  return newArr.filter((id) => !oldSet.has(String(id)))
}

async function start(userId) {
  if (!userId) return
  if (currentUserId === userId && channel) return
  stop()
  currentUserId = userId

  await loadExistingNotifications(userId)

  channel = supabase
    .channel(`notif-watch-${userId}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "user_preferences", filter: `id=eq.${userId}` },
      async (payload) => {
        const oldInvites   = payload.old?.invite_requests || []
        const newInvitesArr= payload.new?.invite_requests || []
        const addedInvites = diffAddedInvites(oldInvites, newInvitesArr)

        const oldReq = payload.old?.friend_requests || []
        const newReq = payload.new?.friend_requests || []
        const addedReq = diffAddedRequests(oldReq, newReq)

        if (addedInvites.length) {
          newInvites.value = await enrichInvites(addedInvites)
          newInviteModalOpen.value = true
          toast.success("You've received a new event invite!")
        }

        if (addedReq.length) {
          newFriendRequests.value = await enrichFriendRequests(addedReq)
          newInviteModalOpen.value = true
          toast.info("You've received a new friend request!")
        }
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") console.log("Notifications watcher active for:", userId)
    })
}

function stop() {
  if (channel) {
    supabase.removeChannel(channel)
    channel = null
    console.log("Notification watcher unsubscribed")
  }
}

onUnmounted(stop)

export function useInviteWatcher() {
  return { start, stop, newInviteModalOpen, newInvites, newFriendRequests }
}
