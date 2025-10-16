<script setup>
import { ref, onMounted, computed, watch } from "vue"
import { supabase } from "@/utils/supabase"
import { toast } from "vue-sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2 } from "lucide-vue-next" // Spinner icon

const searchQuery = ref("")
const searchResults = ref([])
const friends = ref([])
const user = ref(null)
const currentPage = ref(1)
const perPage = 5
const loading = ref(false)
const pageLoading = ref(true)
const confirmOpen = ref(false)
const friendToRemove = ref(null)

const totalPages = computed(() => Math.ceil(friends.value.length / perPage))
const paginatedFriends = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return friends.value.slice(start, start + perPage)
})

onMounted(async () => {
  const { data: auth } = await supabase.auth.getUser()
  if (auth?.user) {
    user.value = auth.user
    await fetchFriends()
  } else {
    toast.error("Please log in first.")
  }
  pageLoading.value = false
})

// Fetch all friends
async function fetchFriends() {
  pageLoading.value = true
  const { data: pref, error } = await supabase
    .from("user_preferences")
    .select("friends")
    .eq("id", user.value.id)
    .single()

  if (error) {
    console.error(error)
    toast.error("Failed to load friends.")
    pageLoading.value = false
    return
  }

  const friendIds = pref?.friends || []
  if (friendIds.length === 0) {
    friends.value = []
    pageLoading.value = false
    return
  }

  const { data, error: fError } = await supabase
    .from("user_preferences")
    .select("id, name, email")
    .in("id", friendIds)

  if (fError) console.error(fError)
  friends.value = data || []
  pageLoading.value = false
}

// Live search
watch(searchQuery, async (newQuery) => {
  if (!newQuery.trim()) {
    searchResults.value = []
    return
  }

  loading.value = true
  const { data, error } = await supabase
    .from("user_preferences")
    .select("id, name, email")
    .or(`name.ilike.%${newQuery}%,email.ilike.%${newQuery}%`)
    .limit(8)

  loading.value = false
  if (error) {
    console.error(error)
    toast.error("Search failed.")
    return
  }

  const friendIds = friends.value.map((f) => f.id)
  searchResults.value = data.filter(
    (u) => u.id !== user.value.id && !friendIds.includes(u.id)
  )
})

// Add friend
async function addFriend(friendId) {
  const { data: pref } = await supabase
    .from("user_preferences")
    .select("friends")
    .eq("id", user.value.id)
    .single()

  const updated = Array.from(new Set([...(pref?.friends || []), friendId]))

  const { error } = await supabase
    .from("user_preferences")
    .update({ friends: updated })
    .eq("id", user.value.id)

  if (error) {
    console.error(error)
    toast.error("Failed to add friend.")
  } else {
    toast.success("Friend added successfully!")
    await fetchFriends()
    searchResults.value = []
    searchQuery.value = ""
  }
}

// Open confirmation dialog
function confirmRemove(friend) {
  friendToRemove.value = friend
  confirmOpen.value = true
}

// Remove friend
async function removeFriendConfirmed() {
  const friendId = friendToRemove.value?.id
  if (!friendId) return

  const { data: pref } = await supabase
    .from("user_preferences")
    .select("friends")
    .eq("id", user.value.id)
    .single()

  const updated = (pref?.friends || []).filter((id) => id !== friendId)

  const { error } = await supabase
    .from("user_preferences")
    .update({ friends: updated })
    .eq("id", user.value.id)

  confirmOpen.value = false
  friendToRemove.value = null

  if (error) {
    console.error(error)
    toast.error("Failed to remove friend.")
  } else {
    toast.info("Friend removed.")
    await fetchFriends()
  }
}
</script>

<template>
  <section class="min-h-screen py-12 px-6 md:px-12 xl:px-20 bg-white relative">
    <!-- LOADING SPINNER -->
    <div
      v-if="pageLoading"
      class="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-50"
    >
      <Loader2 class="h-10 w-10 text-blue-600 animate-spin mb-3" />
      <p class="text-gray-600">Loading your friends...</p>
    </div>

    <!-- Header -->
    <div class="text-center mb-10">
      <h1 class="text-3xl font-extrabold text-gray-900">Friends</h1>
      <p class="text-lg text-gray-600 mt-2">
        Add new friends or manage your current connections.
      </p>
    </div>

    <!-- Search -->
    <div class="max-w-md mx-auto mb-8 relative">
      <div class="flex gap-2 relative">
        <Input
          v-model="searchQuery"
          placeholder="Search users by name or email..."
          class="flex-1 border border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-lg px-4"
        />
        <Button
          class="cursor-pointer"
          @click="searchQuery ? null : toast.info('Type a name or email to search!')"
        >
          Search
        </Button>
      </div>

      <!-- Autocomplete dropdown -->
      <ul
        v-if="searchResults.length || loading"
        class="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-10 max-h-72 overflow-y-auto"
      >
        <li
          v-if="loading"
          class="px-4 py-3 text-gray-500 text-sm flex justify-center items-center"
        >
          <Loader2 class="h-4 w-4 text-blue-500 animate-spin mr-2" />
          Searching...
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
          <Button size="sm" class="cursor-pointer" @click="addFriend(user.id)">Add</Button>
        </li>

        <li
          v-if="!loading && searchResults.length === 0 && searchQuery"
          class="px-4 py-3 text-gray-500 text-sm text-center"
        >
          No users found.
        </li>
      </ul>
    </div>

    <!-- Friends Table -->
    <div class="max-w-4xl mx-auto mt-16">
      <h2 class="text-center text-xl font-extrabold text-gray-800 mb-4">
        Friends List
      </h2>

      <Table>
        <TableCaption v-if="friends.length === 0 && !pageLoading">
          You have no friends yet 😢
        </TableCaption>

        <TableHeader v-else>
          <TableRow>
            <TableHead class="w-[60px] text-center">S/N</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead class="text-center w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow
            v-for="(f, index) in paginatedFriends"
            :key="f.id"
            class="hover:bg-gray-50"
          >
            <TableCell class="text-center font-medium text-gray-600">
              {{ index + 1 + (currentPage - 1) * perPage }}
            </TableCell>
            <TableCell>
              <p class="font-semibold text-gray-900">{{ f.name }}</p>
            </TableCell>
            <TableCell>
              <p class="text-sm text-gray-500">{{ f.email }}</p>
            </TableCell>
            <TableCell class="text-center">
              <Button
                variant="destructive"
                size="sm"
                class="cursor-pointer"
                @click="confirmRemove(f)"
              >
                Remove
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex justify-center gap-3 mt-6 items-center"
      >
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          Prev
        </Button>
        <span class="text-gray-600 text-sm">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Next
        </Button>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <Dialog v-model:open="confirmOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Remove Friend</DialogTitle>
        </DialogHeader>
        <p class="text-gray-600 mb-4">
          Are you sure you want to remove
          <span class="font-semibold text-gray-900">
            {{ friendToRemove?.name }}
          </span>
          from your friends list?
        </p>
        <DialogFooter>
          <Button variant="outline" class="cursor-pointer" @click="confirmOpen = false">
            Cancel
          </Button>
          <Button variant="destructive" class="cursor-pointer" @click="removeFriendConfirmed">
            Yes, Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </section>
</template>

<style scoped>
section {
  font-family: system-ui, sans-serif;
}
</style>
