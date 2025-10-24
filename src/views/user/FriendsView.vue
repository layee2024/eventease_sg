<script setup>
import { ref, onMounted, computed, watch } from "vue"
import { supabase } from "@/utils/supabase"
import { toast } from "vue-sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-vue-next"

const searchQuery = ref("")
const searchResults = ref([])
const friends = ref([])
const requests = ref([])
const user = ref(null)

const currentPage = ref(1)
const perPage = 5

const loading = ref(false)
const pageLoading = ref(true)

const confirmOpen = ref(false)
const friendToRemove = ref(null)

const requestsOpen = ref(false)

const inviteOpen = ref(false)
const inviteTarget = ref(null)
const joinedEvents = ref([])
const eventPage = ref(1)
const eventPerPage = 4

const totalEventPages = computed(() => Math.ceil(joinedEvents.value.length / eventPerPage))
const paginatedEvents = computed(() => {
  const start = (eventPage.value - 1) * eventPerPage
  return joinedEvents.value.slice(start, start + eventPerPage)
})

const inviteRequestsOpen = ref(false)
const invites = ref([])

const totalPages = computed(() => Math.ceil(friends.value.length / perPage))
const paginatedFriends = computed(() => {
  const start = (currentPage.value - 1) * perPage
  console.log(paginatedFriends)
  return friends.value.slice(start, start + perPage)
})

onMounted(async () => {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) {
    toast.error("Please login first.")
    return
  }
  user.value = auth.user
  await Promise.all([fetchFriends(), fetchRequests(), fetchInvites()])
  pageLoading.value = false
})

// Friends I already have
async function fetchFriends() {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("friends")
    .eq("id", user.value.id)
    .single()
  if (error) {
    toast.error("Failed to load friends.")
    friends.value = []
    return
  }
  const ids = data?.friends || []
  if (!ids.length) {
    friends.value = []
    return
  }
  const { data: users } = await supabase
    .from("user_preferences")
    .select("id,name,email,profile_picture")
    .in("id", ids)
  friends.value = users || []
}

async function fetchRequests() {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("friend_requests")
    .eq("id", user.value.id)
    .single()
  if (error) {
    toast.error("Failed to load requests.")
    requests.value = []
    return
  }
  const ids = data?.friend_requests || []
  if (!ids.length) {
    requests.value = []
    return
  }
  const { data: reqUsers } = await supabase
    .from("user_preferences")
    .select("id,name,email,profile_picture")
    .in("id", ids)
  requests.value = reqUsers || []
}

async function fetchInvites() {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("invite_requests")
    .eq("id", user.value.id)
    .single()

  if (error) {
    console.error(error)
    invites.value = []
    toast.error("Failed to load invites.")
    return
  }

  const raw = data?.invite_requests || []
  if (!raw.length) {
    invites.value = []
    return
  }

  const eventIds = [...new Set(raw.map(i => i.event_id))]
  const fromIds = [...new Set(raw.map(i => i.from))]

  const [{ data: evs }, { data: users }] = await Promise.all([
    supabase.from("events").select("id,title").in("id", eventIds),
    supabase.from("user_preferences").select("id,name,email").in("id", fromIds)
  ])

  const evMap = new Map((evs || []).map(e => [e.id, e]))
  const userMap = new Map((users || []).map(u => [u.id, u]))

  invites.value = raw.map(i => ({
    ...i,
    eventTitle: evMap.get(i.event_id)?.title || "(Unknown event)",
    fromUser: userMap.get(i.from) || { name: "Someone" }
  }))
}

watch(searchQuery, async (q) => {
  if (!q.trim()) {
    searchResults.value = []
    return
  }
  loading.value = true
  const { data, error } = await supabase
    .from("user_preferences")
    .select("id,name,email")
    .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
    .limit(8)
  loading.value = false
  if (error) {
    toast.error("Search failed.")
    return
  }
  const friendIds = friends.value.map((f) => f.id)
  searchResults.value = (data || []).filter(
    (u) => u.id !== user.value.id && !friendIds.includes(u.id)
  )
})

async function sendRequest(targetId) {
  if (!targetId) return
  const { data: me } = await supabase
    .from("user_preferences")
    .select("sent_requests")
    .eq("id", user.value.id)
    .single()
  const { data: target } = await supabase
    .from("user_preferences")
    .select("friend_requests")
    .eq("id", targetId)
    .single()

  const mySent = Array.from(new Set([...(me?.sent_requests || []), targetId]))
  const targetPending = Array.from(new Set([...(target?.friend_requests || []), user.value.id]))

  const { error: e1 } = await supabase
    .from("user_preferences")
    .update({ sent_requests: mySent })
    .eq("id", user.value.id)
  const { error: e2 } = await supabase
    .from("user_preferences")
    .update({ friend_requests: targetPending })
    .eq("id", targetId)

  if (e1 || e2) {
    toast.error("Failed to send request.")
    return
  }
  toast.success("Friend request sent!")
  searchResults.value = []
  searchQuery.value = ""
}

async function acceptRequest(requesterId) {
  const { data: me } = await supabase
    .from("user_preferences")
    .select("friends,friend_requests")
    .eq("id", user.value.id)
    .single()
  const { data: requester } = await supabase
    .from("user_preferences")
    .select("friends,sent_requests")
    .eq("id", requesterId)
    .single()

  const myFriends = Array.from(new Set([...(me?.friends || []), requesterId]))
  const requesterFriends = Array.from(new Set([...(requester?.friends || []), user.value.id]))
  const updatedMyRequests = (me?.friend_requests || []).filter((id) => id !== requesterId)
  const updatedRequesterSent = (requester?.sent_requests || []).filter((id) => id !== user.value.id)

  const { error: e1 } = await supabase
    .from("user_preferences")
    .update({ friends: myFriends, friend_requests: updatedMyRequests })
    .eq("id", user.value.id)
  const { error: e2 } = await supabase
    .from("user_preferences")
    .update({ friends: requesterFriends, sent_requests: updatedRequesterSent })
    .eq("id", requesterId)

  if (e1 || e2) {
    toast.error("Failed to accept request.")
    return
  }
  toast.success("Friend added!")
  await Promise.all([fetchFriends(), fetchRequests()])
}

async function declineRequest(requesterId) {
  const { data: me } = await supabase
    .from("user_preferences")
    .select("friend_requests")
    .eq("id", user.value.id)
    .single()
  const { data: requester } = await supabase
    .from("user_preferences")
    .select("sent_requests")
    .eq("id", requesterId)
    .single()

  const updatedMe = (me?.friend_requests || []).filter((id) => id !== requesterId)
  const updatedRequester = (requester?.sent_requests || []).filter((id) => id !== user.value.id)

  await supabase.from("user_preferences").update({ friend_requests: updatedMe }).eq("id", user.value.id)
  await supabase.from("user_preferences").update({ sent_requests: updatedRequester }).eq("id", requesterId)
  toast.info("Request declined.")
  await fetchRequests()
}

function confirmRemove(friend) {
  friendToRemove.value = friend
  confirmOpen.value = true
}

async function removeFriendConfirmed() {
  try {
    const friendId = friendToRemove.value?.id
    if (!friendId || !user.value?.id) {
      toast.error("Missing user or friend ID.")
      return
    }

    const { data: me, error: meErr } = await supabase
      .from("user_preferences")
      .select("friends")
      .eq("id", user.value.id)
      .single()

    const { data: friend, error: frErr } = await supabase
      .from("user_preferences")
      .select("friends")
      .eq("id", friendId)
      .single()

    if (meErr || frErr) throw new Error("Failed to load friendship data.")

    const myFriends = (me?.friends || []).map(String).filter((id) => id !== String(friendId))
    const friendFriends = (friend?.friends || []).map(String).filter((id) => id !== String(user.value.id))

    const { error: e1 } = await supabase
      .from("user_preferences")
      .update({ friends: myFriends })
      .eq("id", user.value.id)
    const { error: e2 } = await supabase
      .from("user_preferences")
      .update({ friends: friendFriends })
      .eq("id", friendId)

    if (e1 || e2) throw new Error("Failed to update both records.")

    toast.success("Friend removed successfully.")
    confirmOpen.value = false
    friendToRemove.value = null

    await fetchFriends()
  } catch (err) {
    console.error("Error removing friend:", err)
    toast.error("Could not remove friend.")
  }
}

// open modal and load my joined events
async function openInviteModal(friend) {
  inviteTarget.value = friend
  inviteOpen.value = true
  await fetchJoinedEvents()
}

async function fetchJoinedEvents() {
  try {
    const { data: userPref, error: userErr } = await supabase
      .from("user_preferences")
      .select("going")
      .eq("id", user.value.id)
      .single()

    if (userErr) throw userErr

    const joinedIds = userPref?.going || []

    if (!joinedIds.length) {
      toast.info("You haven't joined any events yet.")
      joinedEvents.value = []
      return
    }

    const { data: events, error: eventErr } = await supabase
      .from("events")
      .select("id, title, venue, start_date, end_date")
      .in("id", joinedIds)

    if (eventErr) throw eventErr

    console.log("Fetched events:", events)
    joinedEvents.value = events || []
  } catch (err) {
    console.error("fetchJoinedEvents error:", err)
    toast.error("Failed to load your joined events.")
    joinedEvents.value = []
  }
}

async function sendEventInvite(targetId, eventId) {
  try {
    // Check if the friend is already in the event
    const { data: target } = await supabase
      .from("user_preferences")
      .select("going")
      .eq("id", targetId)
      .single()

    if (target?.going?.includes(eventId)) {
      toast.info("User already joined this event.")
      return
    }

    // Get invite data
    const [{ data: me }, { data: targetInvites }] = await Promise.all([
      supabase
        .from("user_preferences")
        .select("sent_invites")
        .eq("id", user.value.id)
        .single(),
      supabase
        .from("user_preferences")
        .select("invite_requests")
        .eq("id", targetId)
        .single(),
    ])

    // Check if an invite for this event already exists
    const alreadyInvited = (targetInvites?.invite_requests || []).some(
      (i) => i.event_id === eventId && i.from === user.value.id
    )
    if (alreadyInvited) {
      toast.info("Invite already sent.")
      return
    }

    const newSent = [...(me?.sent_invites || []), { event_id: eventId, to: targetId }]
    const newReceived = [...(targetInvites?.invite_requests || []), { event_id: eventId, from: user.value.id }]

    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("user_preferences").update({ sent_invites: newSent }).eq("id", user.value.id),
      supabase.from("user_preferences").update({ invite_requests: newReceived }).eq("id", targetId),
    ])

    if (e1 || e2) throw new Error("Failed to update records")

    toast.success("Invite sent!")
    inviteOpen.value = false
    await fetchInvites()
  } catch (err) {
    console.error(err)
    toast.error("Could not send invite.")
  }
}


async function acceptInvite(inv) {
  try {
    const { data: me, error: meErr } = await supabase
      .from("user_preferences")
      .select("going")
      .eq("id", user.value.id)
      .single()
    if (meErr) throw meErr

    const updatedGoing = Array.from(new Set([...(me?.going || []), inv.event_id]))
    const { error: eGoing } = await supabase
      .from("user_preferences")
      .update({ going: updatedGoing })
      .eq("id", user.value.id)
    if (eGoing) throw eGoing

    const [{ data: myInvites }, { data: senderInvites }] = await Promise.all([
      supabase.from("user_preferences").select("invite_requests").eq("id", user.value.id).single(),
      supabase.from("user_preferences").select("sent_invites").eq("id", inv.from).single(),
    ])

    const myUpdated = (myInvites?.invite_requests || [])
      .filter((i) => !(i.event_id === inv.event_id && i.from === inv.from))
    const senderUpdated = (senderInvites?.sent_invites || [])
      .filter((i) => !(i.event_id === inv.event_id && i.to === user.value.id))

    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("user_preferences").update({ invite_requests: myUpdated }).eq("id", user.value.id),
      supabase.from("user_preferences").update({ sent_invites: senderUpdated }).eq("id", inv.from),
    ])
    if (e1 || e2) throw new Error("Failed to finalize invite")

    toast.success("Joined event successfully!")
    await fetchInvites()
    await fetchJoinedEvents()
  } catch (err) {
    console.error("acceptInvite error:", err)
    toast.error("Could not accept invite.")
  }
}


async function declineInvite(inv) {
  try {
    const [{ data: me }, { data: sender }] = await Promise.all([
      supabase.from("user_preferences").select("invite_requests").eq("id", user.value.id).single(),
      supabase.from("user_preferences").select("sent_invites").eq("id", inv.from).single()
    ])

    const myUpdated = (me?.invite_requests || [])
      .filter(i => !(i.event_id === inv.event_id && i.from === inv.from))
    const senderUpdated = (sender?.sent_invites || [])
      .filter(i => !(i.event_id === inv.event_id && i.to === user.value.id))

    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("user_preferences").update({ invite_requests: myUpdated }).eq("id", user.value.id),
      supabase.from("user_preferences").update({ sent_invites: senderUpdated }).eq("id", inv.from)
    ])
    if (e1 || e2) throw new Error("Failed to update invite")

    toast.info("Invite declined.")
    await fetchInvites()
  } catch (err) {
    console.error(err)
    toast.error("Could not decline invite.")
  }
}
</script>

<template>
  <section class="min-h-screen py-12 px-6 md:px-12 xl:px-20 bg-white relative">
    <!-- Loading Spinner -->
    <div v-if="pageLoading" class="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-50">
      <Loader2 class="h-10 w-10 text-blue-600 animate-spin mb-3" />
      <p class="text-gray-600">Loading your friends...</p>
    </div>

    <!-- Header -->
    <div class="text-center mb-10">
      <h1 class="text-3xl font-extrabold text-gray-900">Friends</h1>
      <p class="text-lg text-gray-600 mt-2">Add new friends or manage your current connections.</p>
    </div>

    <!-- Search -->
    <div class="max-w-md mx-auto mb-8 relative">
      <div class="flex gap-2 relative">
        <Input
          v-model="searchQuery"
          placeholder="Search users by name or email..."
          class="flex-1 border border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-lg px-4"
        />
        <Button class="cursor-pointer" @click="searchQuery ? null : toast.info('Type a name or email to search!')">
          Search
        </Button>
      </div>

      <!-- Autocomplete -->
      <ul
        v-if="searchResults.length || loading"
        class="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-10 max-h-72 overflow-y-auto"
      >
        <li v-if="loading" class="px-4 py-3 text-gray-500 text-sm flex justify-center items-center">
          <Loader2 class="h-4 w-4 text-blue-500 animate-spin mr-2" /> Searching...
        </li>

        <li
          v-for="user in searchResults"
          :key="user.id"
          class="px-4 py-2 flex justify-between items-center hover:bg-gray-50 transition"
        >
          <div>
            <p class="font-semibold text-gray-900">{{ user.name }}</p>
            <p class="text-sm text-gray-500">{{ user.email }}</p>
          </div>
          <Button size="sm" class="cursor-pointer" @click="sendRequest(user.id)">Request</Button>
        </li>

        <li v-if="!loading && searchResults.length === 0 && searchQuery" class="px-4 py-3 text-gray-500 text-sm text-center">
          No users found.
        </li>
      </ul>
    </div>

    <!-- Friends Table -->
    <div class="max-w-4xl mx-auto mt-16">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 text-center sm:text-left">
        <h2 class="text-xl font-extrabold text-gray-800">Friends List</h2>

        <div class="flex justify-center sm:justify-end gap-2">
          <Button variant="outline" class="cursor-pointer" @click="requestsOpen = true">
            Friend Requests ({{ requests.length }})
          </Button>
          <Button variant="outline" class="cursor-pointer" @click="inviteRequestsOpen = true">
            Invite Requests ({{ invites.length }})
          </Button>
        </div>
      </div>

      <Table>
        <TableCaption v-if="friends.length === 0 && !pageLoading">You have no friends yet 😢</TableCaption>

        <TableHeader v-else>
          <TableRow>
            <TableHead class="w-[60px] text-center">S/N</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead class="text-center w-[200px]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="(f, index) in paginatedFriends" :key="f.id" class="hover:bg-gray-50">
            <TableCell class="text-center font-medium text-gray-600">
              {{ index + 1 + (currentPage - 1) * perPage }}
            </TableCell>
            <TableCell class="flex items-center gap-3">
              <img
                :src="f.profile_picture || '/default-avatar.png'"
                alt="Profile Picture"
                class="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              <p class="font-semibold text-gray-900">{{ f.name }}</p>
            </TableCell>
            <TableCell>
              <p class="text-sm text-gray-500">{{ f.email }}</p>
            </TableCell>
            <TableCell class="text-center">
              <div class="flex justify-center gap-2">
                <Button variant="secondary" size="sm" class="cursor-pointer" @click="openInviteModal(f)">
                  Invite
                </Button>
                <Button size="sm" variant="destructive" class="cursor-pointer" @click="confirmRemove(f)">Remove</Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center gap-3 mt-6 items-center">
        <Button variant="outline" size="sm" :disabled="currentPage === 1" @click="currentPage--">Prev</Button>
        <span class="text-gray-600 text-sm">Page {{ currentPage }} of {{ totalPages }}</span>
        <Button variant="outline" size="sm" :disabled="currentPage === totalPages" @click="currentPage++">Next</Button>
      </div>
    </div>

    <!-- Friend Requests Dialog -->
    <Dialog v-model:open="requestsOpen">
      <DialogContent class="max-w-md">
        <DialogHeader><DialogTitle>Pending Friend Requests</DialogTitle></DialogHeader>
        <ul v-if="requests.length" class="divide-y divide-gray-200">
          <li v-for="r in requests" :key="r.id" class="py-3 flex justify-between items-center">
            <div>
              <p class="font-semibold text-gray-900">{{ r.name }}</p>
              <p class="text-sm text-gray-500">{{ r.email }}</p>
            </div>
            <div class="flex gap-2">
              <Button size="sm" class="cursor-pointer" @click="acceptRequest(r.id)">Accept</Button>
              <Button variant="outline" size="sm" class="cursor-pointer" @click="declineRequest(r.id)">Decline</Button>
            </div>
          </li>
        </ul>
        <p v-else class="text-center text-gray-500 py-4">No pending requests.</p>
      </DialogContent>
    </Dialog>

    <!-- Invite Friend Dialog -->
    <Dialog v-model:open="inviteOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite {{ inviteTarget?.name }} to an Event</DialogTitle>
        </DialogHeader>

        <!-- Pagination Setup -->
        <div v-if="joinedEvents.length" class="space-y-3 mt-2">
          <div
            v-for="ev in paginatedEvents"
            :key="ev.id"
            class="border border-gray-200 rounded-lg p-3 flex justify-between items-center"
          >
            <div>
              <p class="font-semibold text-gray-800">{{ ev.title }}</p>
              <p class="text-sm text-gray-500">{{ ev.venue }}</p>
            </div>
            <Button size="sm" class="cursor-pointer" @click="sendEventInvite(inviteTarget.id, ev.id)">
              Invite
            </Button>
          </div>

          <!-- Dot Pagination -->
          <div v-if="totalEventPages > 1" class="flex justify-center mt-3 space-x-2">
            <span
              v-for="n in totalEventPages"
              :key="'event-dot-' + n"
              class="w-3 h-3 rounded-full cursor-pointer transition-all duration-300"
              :class="eventPage === n ? 'bg-blue-600 scale-110' : 'bg-gray-400 opacity-50'"
              @click="eventPage = n"
            ></span>
          </div>
        </div>

        <p v-else class="text-gray-500 text-center py-3">
          You haven't joined any events yet.
        </p>
      </DialogContent>
    </Dialog>


    <!-- Invite Requests Dialog -->
    <Dialog v-model:open="inviteRequestsOpen">
      <DialogContent class="max-w-md">
        <DialogHeader><DialogTitle>Event Invites</DialogTitle></DialogHeader>

        <ul v-if="invites.length" class="divide-y divide-gray-200">
          <li v-for="i in invites" :key="i.event_id + '-' + i.from" class="py-3 flex justify-between items-center">
            <div>
              <p class="font-semibold text-gray-900">{{ i.fromUser?.name }} invited you</p>
              <p class="text-sm text-gray-500">{{ i.eventTitle }}</p>
            </div>
            <div class="flex gap-2">
              <Button size="sm" class="cursor-pointer" @click="acceptInvite(i)">Accept</Button>
              <Button variant="outline" size="sm" class="cursor-pointer" @click="declineInvite(i)">Decline</Button>
            </div>
          </li>
        </ul>

        <p v-else class="text-center text-gray-500 py-4">No event invites yet.</p>
      </DialogContent>
    </Dialog>

    <!-- Confirm Remove Dialog -->
    <Dialog v-model:open="confirmOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Remove Friend</DialogTitle>
        </DialogHeader>
        <p class="text-gray-600 mb-4">
          Are you sure you want to remove
          <span class="font-semibold text-gray-900">{{ friendToRemove?.name }}</span>
          from your friends list?
        </p>
        <DialogFooter>
          <Button variant="outline" class="cursor-pointer" @click="confirmOpen = false">Cancel</Button>
          <Button variant="destructive" class="cursor-pointer" @click="removeFriendConfirmed">Yes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </section>
</template>
