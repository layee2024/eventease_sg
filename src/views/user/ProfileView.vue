<script setup>
import { ref, computed, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import { supabase } from "@/utils/supabase"
import { toast } from "vue-sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-vue-next"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

const router = useRouter()

const user = ref(null)
const name = ref("")
const email = ref("")
const userId = ref(null)

const profilePicture = ref("")
const interests = ref([])
const budget = ref("all")
const transportModes = ref([])

// Joined events
const joinedEvents = ref([])
const loadingEvents = ref(false)
const joinedOpen = ref(false)

//filter for the joined events
const joinedFilter = ref("upcoming")

// Pagination
const joinedCurrentPage = ref(1)
const joinedItemsPerPage = 5

const totalJoinedPages = computed(() =>
  Math.ceil(joinedEvents.value.length / joinedItemsPerPage)
)

const filteredJoinedEvents = computed(() => {
  const now = new Date()
  if (joinedFilter.value === "upcoming") {
    return joinedEvents.value.filter((e) => new Date(e.start_date) >= now)
  } else if (joinedFilter.value === "past") {
    return joinedEvents.value.filter((e) => new Date(e.start_date) < now)
  }
  return joinedEvents.value 
})

const paginatedJoinedEvents = computed(() => {
  const start = (joinedCurrentPage.value - 1) * joinedItemsPerPage
  const end = start + joinedItemsPerPage
  return filteredJoinedEvents.value.slice(start, end)
})

function nextJoinedPage() {
  if (joinedCurrentPage.value < totalJoinedPages.value)
    joinedCurrentPage.value++
}

function prevJoinedPage() {
  if (joinedCurrentPage.value > 1) joinedCurrentPage.value--
}

// Reset to first page whenever modal opens
watch(joinedOpen, (open) => {
  if (open) joinedCurrentPage.value = 1
})

// Modal
const avatarOpen = ref(false)
const interestsOpen = ref(false)
const budgetOpen = ref(false)
const transportOpen = ref(false)

// temporary modal state
const tempInterests = ref([])
const tempBudget = ref("all")
const tempTransport = ref([])

const AVATARS = Array.from({ length: 10 }, (_, i) => {
  const ids = [1, 2, 3, 4, 5, 61, 62, 63, 64, 65]
  return `/avatars/${ids[i]}.png`
})

const PLACEHOLDER = "/avatars/placeholder.png"

const categories = [
  "Music","Food","Arts","Technology","Sports",
  "Education","Business","Culture","Health","Social","Environment",
]
const transportOptions = ["MRT", "Bus", "Car", "Bicycle", "Walk"]

const categoryColor = (cat) =>
  ({
    Music: "bg-purple-600",
    Food: "bg-orange-500",
    Arts: "bg-pink-500",
    Technology: "bg-blue-600",
    Sports: "bg-green-500",
    Education: "bg-indigo-600",
    Business: "bg-gray-600",
    Culture: "bg-red-500",
    Health: "bg-teal-500",
    Social: "bg-yellow-500",
    Environment: "bg-green-600",
  }[cat] || "bg-gray-500")

onMounted(async () => {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) {
    toast.error("Please login first")
    router.push("/login")
    return
  }

  user.value = auth.user
  userId.value = auth.user.id
  name.value = `${auth.user.user_metadata?.first_name || ""} ${auth.user.user_metadata?.last_name || ""}`.trim() || "Anonymous User"
  email.value = auth.user.email

  const { data, error } = await supabase
    .from("user_preferences")
    .select("interests, budget, transport_mode, profile_picture, going")
    .eq("id", userId.value)
    .maybeSingle()

  if (error) {
    console.error(error)
    toast.error("Failed to load preferences")
    return
  }

  if (!data) {
    const { error: insertErr } = await supabase.from("user_preferences").insert({
      id: userId.value,
      interests: [],
      budget: "all",
      transport_mode: [],
      going: [],
      saved: [],
      onboarding: true,
      profile_picture: PLACEHOLDER,
    })
    if (insertErr) console.error(insertErr)
    profilePicture.value = PLACEHOLDER
    joinedEvents.value = []
    return
  }

  interests.value = data.interests || []
  budget.value = data.budget || "all"
  transportModes.value = data.transport_mode || []
  profilePicture.value = data.profile_picture || PLACEHOLDER

  const eventIds = Array.isArray(data.going) ? data.going : []
  await fetchJoinedEvents(eventIds)
})

// Fetch joined events
async function fetchJoinedEvents(ids) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      joinedEvents.value = []
      return
    }
    loadingEvents.value = true

    const { data, error } = await supabase
      .from("events")
      .select("id, title, start_date, venue, image_url, description")
      .in("id", ids)

    if (error) throw error

    // Filter out past events
    const now = new Date()
    joinedEvents.value = (data || [])
      //.filter((e) => new Date(e.start_date) >= now)
      //.sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
      joinedEvents.value = (data || []).sort((a, b) => new Date(a.start_date) - new Date(b.start_date))

  } catch (err) {
    console.error("Error fetching joined events:", err?.message || err)
    toast.error("Failed to load joined events.")
  } finally {
    loadingEvents.value = false
  }
}

async function updatePrefs(patch) {
  const { error } = await supabase
    .from("user_preferences")
    .update(patch)
    .eq("id", userId.value)
  if (error) throw error
}

// open modals with cloned data
function openInterestsModal() {
  tempInterests.value = [...interests.value]
  interestsOpen.value = true
}
function openBudgetModal() {
  tempBudget.value = budget.value
  budgetOpen.value = true
}
function openTransportModal() {
  tempTransport.value = [...transportModes.value]
  transportOpen.value = true
}

// save functions
async function saveInterests() {
  try {
    interests.value = [...tempInterests.value]
    await updatePrefs({ interests: interests.value })
    toast.success("Interests updated")
    interestsOpen.value = false
  } catch {
    toast.error("Failed to update interests")
  }
}

async function saveBudget() {
  try {
    budget.value = tempBudget.value
    await updatePrefs({ budget: budget.value })
    toast.success("Budget updated")
    budgetOpen.value = false
  } catch {
    toast.error("Failed to update budget")
  }
}

async function saveTransport() {
  try {
    transportModes.value = [...tempTransport.value]
    await updatePrefs({ transport_mode: transportModes.value })
    toast.success("Transport updated")
    transportOpen.value = false
  } catch {
    toast.error("Failed to update transport")
  }
}

async function chooseAvatar(src) {
  try {
    profilePicture.value = src
    await updatePrefs({ profile_picture: src })
    window.dispatchEvent(new CustomEvent('profile-picture-updated', { detail: src }));
    toast.success("Profile picture updated")
    avatarOpen.value = false
  } catch {
    toast.error("Failed to update profile picture")
  }
}

const initials = computed(() =>
  name.value
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
)
</script>

<template>
  <section class="min-h-[93vh] py-10 md:py-16">
    <div class="container mx-auto max-w-6xl px-4">
      <div class="grid gap-7 md:grid-cols-3">
        <!-- Profile -->
        <div class="flex justify-center items-center bg-blue-600 text-white rounded-xl p-8 relative">
          <div class="flex flex-col items-center text-center gap-5">
            <div class="size-36 rounded-full overflow-hidden bg-white/10 ring-4 ring-white/20 grid place-items-center">
              <img v-if="profilePicture" :src="profilePicture" alt="avatar" class="size-full object-cover" />
              <span v-else class="text-2xl font-bold">{{ initials }}</span>
            </div>
            <Button variant="secondary" @click="avatarOpen = true" class="cursor-pointer">
              Change Photo
            </Button>
            <div class="space-y-1">
              <h1 class="text-blue-100 text-xl font-semibold">{{ name }}</h1>
            </div>
          </div>
        </div>

        <!-- Preferences cards -->
        <div class="md:col-span-2 grid gap-6 sm:grid-cols-2">
          <!-- Interests -->
          <Card class="hover:shadow-md transition">
            <CardContent class="p-6">
              <p class="text-sm text-gray-500 dark:text-gray-300 mb-2">Preferences</p>
              <h3 class="text-xl font-semibold mb-4">Interests</h3>
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  v-for="cat in (interests.length ? interests : ['None selected'])"
                  :key="cat"
                  class="px-2.5 py-1 rounded-full text-xs text-white"
                  :class="categoryColor(cat)"
                >
                  {{ cat }}
                </span>
              </div>
              <Button variant="outline" size="sm" @click="openInterestsModal" class="cursor-pointer">Manage</Button>
            </CardContent>
          </Card>

          <!-- Budget -->
          <Card class="hover:shadow-md transition">
            <CardContent class="p-6">
              <p class="text-sm text-gray-500 dark:text-gray-300 mb-2">Finances</p>
              <h3 class="text-xl font-semibold mb-4">Budget</h3>
              <p class="text-gray-700 dark:text-gray-100 capitalize mb-4">
                {{ budget === 'all' ? 'All budgets' :
                   budget === 'low' ? 'Below $20' :
                   budget === 'mid' ? '$20-$50' : 'Above $50' }}
              </p>
              <Button variant="outline" size="sm" @click="openBudgetModal" class="cursor-pointer">Manage</Button>
            </CardContent>
          </Card>

          <!-- Transport -->
          <Card class="hover:shadow-md transition">
            <CardContent class="p-6">
              <p class="text-sm text-gray-500 dark:text-gray-300 mb-2">Commute</p>
              <h3 class="text-xl font-semibold mb-4">Transport</h3>
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  v-for="mode in (transportModes.length ? transportModes : ['None selected'])"
                  :key="mode"
                  class="px-2.5 py-1 rounded-full text-xs bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                >
                  {{ mode }}
                </span>
              </div>
              <Button variant="outline" size="sm" @click="openTransportModal" class="cursor-pointer">Manage</Button>
            </CardContent>
          </Card>

          <!-- Current Events Joined -->
          <Card class="hover:shadow-md transition">
            <CardContent class="p-6">
              <p class="text-sm text-gray-500 dark:text-gray-300 mb-2">Activity</p>
              <h3 class="text-xl font-semibold mb-2">Current Events Joined</h3>

              <p v-if="!joinedEvents.length" class="text-gray-700 dark:text-gray-300 mb-3">
                You haven't joined any events yet.
              </p>

              <div v-else class="mb-3">
                <p class="text-gray-700 dark:text-gray-300">
                  {{ joinedEvents.length }} event<span v-if="joinedEvents.length > 1">s</span> joined
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-100 mt-1">
                  Most recent: {{ new Date(joinedEvents[0].start_date).toLocaleDateString() }}
                </p>
              </div>

              <Button variant="link" class="mt-2 px-0 cursor-pointer" @click="joinedOpen = true">
                View all →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <!-- Change Photo Modal -->
    <Dialog v-model:open="avatarOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Choose a Profile Photo</DialogTitle>
        </DialogHeader>

        <div class="grid grid-cols-5 gap-3 py-4">
          <img
            v-for="src in AVATARS"
            :key="src"
            :src="src"
            alt="Avatar option"
            class="w-16 h-16 rounded-full cursor-pointer border-3 transition hover:border-blue-500"
            :class="{ 'border-sky-400': profilePicture === src }"
            @click="chooseAvatar(src)"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" @click="avatarOpen = false" class="cursor-pointer">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <!-- Joined Events Modal -->
    <Dialog v-model:open="joinedOpen">
      <DialogContent class="max-w-2xl">

        <DialogHeader>
          <DialogTitle>Your Joined Events</DialogTitle>
          <div class="flex justify-end mt-8">
            <Select v-model="joinedFilter">
              <SelectTrigger class="w-40">
                <SelectValue :placeholder="'Filter events'" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

  

        <div
          v-if="loadingEvents"
          class="flex items-center justify-center py-10 text-gray-500"
        >
          <Loader2 class="h-6 w-6 animate-spin mr-2 text-blue-600" />
          Loading events...
        </div>

        <div v-else>
          <!-- Paginated Events -->
          <ul
            v-if="paginatedJoinedEvents.length"
            class="divide-y divide-gray-200"
          >
            <li
              v-for="e in paginatedJoinedEvents"
              :key="e.id"
              class="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p class="font-semibold text-gray-900 dark:text-gray-300">{{ e.title }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ new Date(e.start_date).toLocaleDateString() }} •
                  {{ e.venue }}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                class="mt-2 sm:mt-0 cursor-pointer"
                @click="router.push(`/event/${e.id}`)"
              >
                View →
              </Button>
            </li>
          </ul>

          <p v-else class="text-center text-gray-500 py-6">
            You haven't joined any events yet.
          </p>

          <!-- Pagination Controls -->
          <div
            v-if="totalJoinedPages > 1"
            class="flex flex-col items-center justify-center mt-6"
          >
            <div class="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                :disabled="joinedCurrentPage === 1"
                @click="prevJoinedPage"
                class="cursor-pointer"
              >
                Previous
              </Button>

              <span class="text-gray-700 dark:text-white font-medium text-sm">
                Page {{ joinedCurrentPage }} of {{ totalJoinedPages }}
              </span>

              <Button
                variant="outline"
                size="sm"
                :disabled="joinedCurrentPage === totalJoinedPages"
                @click="nextJoinedPage"
                class="cursor-pointer"
              >
                Next
              </Button>
            </div>

            <div class="text-gray-500 dark:text-white text-xs mt-2">
              Showing
              {{ (joinedCurrentPage - 1) * joinedItemsPerPage + 1 }} -
              {{ Math.min(
                joinedCurrentPage * joinedItemsPerPage,
                joinedEvents.length
              ) }}
              of {{ joinedEvents.length }} joined events
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Interests modal -->
    <Dialog v-model:open="interestsOpen">
      <DialogContent class="max-w-xl">
        <DialogHeader><DialogTitle>Edit interests</DialogTitle></DialogHeader>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="cat in categories"
            :key="cat"
            class="py-2 px-4 border rounded-lg text-sm font-medium transition"
            :class="tempInterests.includes(cat)
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'"
            @click="tempInterests.includes(cat)
              ? tempInterests.splice(tempInterests.indexOf(cat), 1)
              : tempInterests.push(cat)"
          >
            {{ cat }}
          </button>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="interestsOpen = false" class="cursor-pointer">Cancel</Button>
          <Button @click="saveInterests" class="cursor-pointer">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Budget modal -->
    <Dialog v-model:open="budgetOpen">
  <DialogContent class="max-w-md">
    <DialogHeader>
      <DialogTitle>Edit budget</DialogTitle>
    </DialogHeader>

    <div class="mt-4">
      <Select v-model="tempBudget">
        <SelectTrigger class="w-full">
          <SelectValue :placeholder="tempBudget
            ? (tempBudget === 'all' ? 'All budgets'
              : tempBudget === 'low' ? 'Below $20'
              : tempBudget === 'mid' ? '$20 - $50'
              : 'Above $50')
            : 'Select a budget range'"
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All budgets</SelectItem>
          <SelectItem value="low">Below $20</SelectItem>
          <SelectItem value="mid">$20 - $50</SelectItem>
          <SelectItem value="high">Above $50</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <DialogFooter class="mt-6">
      <Button variant="outline" @click="budgetOpen = false" class="cursor-pointer">Cancel</Button>
      <Button @click="saveBudget" class="cursor-pointer">Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>



    <!-- Transport modal -->
    <Dialog v-model:open="transportOpen">
      <DialogContent class="max-w-md">
        <DialogHeader><DialogTitle>Edit transport</DialogTitle></DialogHeader>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="mode in transportOptions"
            :key="mode"
            class="py-2 px-4 border rounded-lg text-sm font-medium transition"
            :class="tempTransport.includes(mode)
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'"
            @click="tempTransport.includes(mode)
              ? tempTransport.splice(tempTransport.indexOf(mode), 1)
              : tempTransport.push(mode)"
          >
            {{ mode }}
          </button>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="transportOpen = false" class="cursor-pointer">Cancel</Button>
          <Button @click="saveTransport" class="cursor-pointer">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </section>
</template>

<style scoped>
.container { max-width: 1100px; }
</style>
