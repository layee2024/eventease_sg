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

const totalPages = computed(() => Math.ceil(friends.value.length / perPage))
const paginatedFriends = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return friends.value.slice(start, start + perPage)
})

onMounted(async () => {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) return toast.error("Please login first.")
  user.value = auth.user
  await Promise.all([fetchFriends(), fetchRequests()])
  pageLoading.value = false
})

// Fetch current friends
async function fetchFriends() {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("friends")
    .eq("id", user.value.id)
    .single()
  if (error) return toast.error("Failed to load friends.")
  const ids = data?.friends || []
  if (!ids.length) return (friends.value = [])
  const { data: users } = await supabase
    .from("user_preferences")
    .select("id,name,email")
    .in("id", ids)
  friends.value = users || []
}

// Fetch friend requests
async function fetchRequests() {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("friend_requests")
    .eq("id", user.value.id)
    .single()
  if (error) return toast.error("Failed to load requests.")
  const ids = data?.friend_requests || []
  if (!ids.length) return (requests.value = [])
  const { data: reqUsers } = await supabase
    .from("user_preferences")
    .select("id,name,email")
    .in("id", ids)
  requests.value = reqUsers || []
}

// Live search
watch(searchQuery, async (q) => {
  if (!q.trim()) return (searchResults.value = [])
  loading.value = true
  const { data, error } = await supabase
    .from("user_preferences")
    .select("id,name,email")
    .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
    .limit(8)
  loading.value = false
  if (error) return toast.error("Search failed.")
  const friendIds = friends.value.map((f) => f.id)
  searchResults.value = data.filter(
    (u) =>
      u.id !== user.value.id &&
      !friendIds.includes(u.id)
  )
})

// Send friend request
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

  if (e1 || e2) return toast.error("Failed to send request.")
  toast.success("Friend request sent!")
  searchResults.value = []
  searchQuery.value = ""
}

// Accept request
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

  if (e1 || e2) return toast.error("Failed to accept request.")
  toast.success("Friend added!")
  await Promise.all([fetchFriends(), fetchRequests()])
}

// Decline request
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

    // Fetch both users’ current friend lists
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

    // Update both records
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
        <Input v-model="searchQuery" placeholder="Search users by name or email..."
          class="flex-1 border border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-lg px-4" />
        <Button class="cursor-pointer" @click="searchQuery ? null : toast.info('Type a name or email to search!')">Search</Button>
      </div>

      <!-- Autocomplete -->
      <ul v-if="searchResults.length || loading" class="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-10 max-h-72 overflow-y-auto">
        <li v-if="loading" class="px-4 py-3 text-gray-500 text-sm flex justify-center items-center">
          <Loader2 class="h-4 w-4 text-blue-500 animate-spin mr-2" /> Searching...
        </li>

        <li v-for="user in searchResults" :key="user.id"
          class="px-4 py-2 flex justify-between items-center hover:bg-gray-50 transition">
          <div>
            <p class="font-semibold text-gray-900">{{ user.name }}</p>
            <p class="text-sm text-gray-500">{{ user.email }}</p>
          </div>
          <Button size="sm" class="cursor-pointer" @click="sendRequest(user.id)">Request</Button>
        </li>

        <li v-if="!loading && searchResults.length === 0 && searchQuery"
          class="px-4 py-3 text-gray-500 text-sm text-center">
          No users found.
        </li>
      </ul>
    </div>

    <!-- Friends Table -->
    <div class="max-w-4xl mx-auto mt-16">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 text-center sm:text-left">
        <h2 class="text-xl font-extrabold text-gray-800">Friends List</h2>

        <Button
          variant="outline"
          class="sm:w-auto mx-auto sm:mx-4 cursor-pointer max-w-1/2"
          @click="requestsOpen = true"
        >
          Friend Requests ({{ requests.length }})
        </Button>
      </div>


      <Table>
        <TableCaption v-if="friends.length === 0 && !pageLoading">You have no friends yet 😢</TableCaption>

        <TableHeader v-else>
          <TableRow>
            <TableHead class="w-[60px] text-center">S/N</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead class="text-center w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="(f, index) in paginatedFriends" :key="f.id" class="hover:bg-gray-50">
            <TableCell class="text-center font-medium text-gray-600">{{ index + 1 + (currentPage - 1) * perPage }}</TableCell>
            <TableCell><p class="font-semibold text-gray-900">{{ f.name }}</p></TableCell>
            <TableCell><p class="text-sm text-gray-500">{{ f.email }}</p></TableCell>
            <TableCell class="text-center">
              <Button variant="destructive" size="sm" class="cursor-pointer" @click="confirmRemove(f)">Remove</Button>
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

    <!-- Requests Dialog -->
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
          <Button variant="destructive" class="cursor-pointer" @click="removeFriendConfirmed">Yes, Remove</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </section>
</template>

<style scoped>

</style>
