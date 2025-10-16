<script setup>
import { ref, computed, onMounted } from "vue"
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

const router = useRouter()

// ---------- state ----------
const user = ref(null)
const name = ref("")
const email = ref("")
const userId = ref(null)

const profilePicture = ref("")
const interests = ref([])
const budget = ref("all")
const transportModes = ref([])

const joinedEvents = ref([])
const loadingEvents = ref(false)
const joinedOpen = ref(false)

const avatarOpen = ref(false)
const interestsOpen = ref(false)
const budgetOpen = ref(false)
const transportOpen = ref(false)

// ---------- constants ----------
const AVATARS = Array.from({ length: 10 }, (_, i) => {
  const ids = [1, 2, 3, 4, 5, 61, 62, 63, 64, 65]
  return `/avatars/${ids[i]}.png`
})

const PLACEHOLDER =
  "https://cdn.vecteezy.com/system/resources/previews/004/511/281/original/default-avatar-photo-placeholder-profile-picture-symbol-vector.jpg"

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

// ---------- lifecycle ----------
onMounted(async () => {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) {
    toast.error("Please login first")
    router.push("/login")
    return
  }

  user.value = auth.user
  userId.value = auth.user.id
  name.value = auth.user.user_metadata?.full_name || "Anonymous User"
  email.value = auth.user.email

  // Load preferences (now includes going)
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
    // first-time user row
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

  // fetch joined events using correct columns
  const eventIds = Array.isArray(data.going) ? data.going : []
  await fetchJoinedEvents(eventIds)
})

// ---------- fetch joined events ----------
async function fetchJoinedEvents(ids) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      joinedEvents.value = []
      return
    }
    loadingEvents.value = true

    // IMPORTANT: use the actual columns in your events table
    // Earlier components used: title, start_date, venue, image_url, description
    const { data, error } = await supabase
      .from("events")
      .select("id, title, start_date, venue, image_url, description")
      .in("id", ids)

    if (error) throw error

    joinedEvents.value = (data || []).sort(
      (a, b) => new Date(b.start_date) - new Date(a.start_date)
    )
  } catch (err) {
    console.error("Error fetching joined events:", err?.message || err)
    toast.error("Failed to load joined events.")
  } finally {
    loadingEvents.value = false
  }
}

// ---------- helpers ----------
async function updatePrefs(patch) {
  const { error } = await supabase
    .from("user_preferences")
    .update(patch)
    .eq("id", userId.value)
  if (error) throw error
}

async function saveInterests() {
  try {
    await updatePrefs({ interests: interests.value })
    toast.success("Interests updated")
    interestsOpen.value = false
  } catch {
    toast.error("Failed to update interests")
  }
}

async function saveBudget() {
  try {
    await updatePrefs({ budget: budget.value })
    toast.success("Budget updated")
    budgetOpen.value = false
  } catch {
    toast.error("Failed to update budget")
  }
}

async function saveTransport() {
  try {
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
    toast.success("Profile picture updated")
    avatarOpen.value = false
  } catch {
    toast.error("Failed to update profile picture")
  }
}

// ---------- computed ----------
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
              <h1 class="text-blue-100 text-xl font-semibold">{{ email }}</h1>
            </div>
          </div>
        </div>

        <!-- Preferences cards -->
        <div class="md:col-span-2 grid gap-6 sm:grid-cols-2">
          <!-- Interests -->
          <Card class="hover:shadow-md transition">
            <CardContent class="p-6">
              <p class="text-sm text-gray-500 mb-2">Preferences</p>
              <h3 class="text-xl font-semibold mb-4">Interests</h3>
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  v-for="cat in (interests.length ? interests : ['None selected'])"
                  :key="cat"
                  class="px-2.5 py-1 rounded-full text-xs bg-gray-900 text-white"
                >
                  {{ cat }}
                </span>
              </div>
              <Button variant="outline" size="sm" @click="interestsOpen = true" class="cursor-pointer">Manage</Button>
            </CardContent>
          </Card>

          <!-- Budget -->
          <Card class="hover:shadow-md transition">
            <CardContent class="p-6">
              <p class="text-sm text-gray-500 mb-2">Preferences</p>
              <h3 class="text-xl font-semibold mb-4">Budget</h3>
              <p class="text-gray-700 capitalize mb-4">
                {{ budget === 'all' ? 'All budgets' :
                   budget === 'low' ? 'Below $20' :
                   budget === 'mid' ? '$20–$50' : 'Above $50' }}
              </p>
              <Button variant="outline" size="sm" @click="budgetOpen = true" class="cursor-pointer">Manage</Button>
            </CardContent>
          </Card>

          <!-- Transport -->
          <Card class="hover:shadow-md transition">
            <CardContent class="p-6">
              <p class="text-sm text-gray-500 mb-2">Preferences</p>
              <h3 class="text-xl font-semibold mb-4">Transport</h3>
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  v-for="mode in (transportModes.length ? transportModes : ['None selected'])"
                  :key="mode"
                  class="px-2.5 py-1 rounded-full text-xs bg-gray-900 text-white"
                >
                  {{ mode }}
                </span>
              </div>
              <Button variant="outline" size="sm" @click="transportOpen = true" class="cursor-pointer">Manage</Button>
            </CardContent>
          </Card>

          <!-- Current Events Joined -->
          <Card class="hover:shadow-md transition">
            <CardContent class="p-6">
              <p class="text-sm text-gray-500 mb-2">Activity</p>
              <h3 class="text-xl font-semibold mb-2">Current Events Joined</h3>

              <p v-if="!joinedEvents.length" class="text-gray-700 mb-3">
                You haven't joined any events yet.
              </p>

              <div v-else class="mb-3">
                <p class="text-gray-700">
                  {{ joinedEvents.length }} event<span v-if="joinedEvents.length > 1">s</span> joined
                </p>
                <p class="text-xs text-gray-500 mt-1">
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

    <!-- Interests modal -->
    <Dialog v-model:open="interestsOpen">
      <DialogContent class="max-w-xl">
        <DialogHeader><DialogTitle>Edit interests</DialogTitle></DialogHeader>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="cat in categories"
            :key="cat"
            class="py-2 px-4 border rounded-lg text-sm font-medium transition"
            :class="interests.includes(cat)
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'"
            @click="interests.includes(cat)
              ? interests.splice(interests.indexOf(cat), 1)
              : interests.push(cat)"
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
        <DialogHeader><DialogTitle>Edit budget</DialogTitle></DialogHeader>
        <div class="flex flex-col gap-2">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" value="all" v-model="budget" /> All budgets
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" value="low" v-model="budget" /> Below $20
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" value="mid" v-model="budget" /> $20-$50
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" value="high" v-model="budget" /> Above $50
          </label>
        </div>
        <DialogFooter>
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
            :class="transportModes.includes(mode)
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'"
            @click="transportModes.includes(mode)
              ? transportModes.splice(transportModes.indexOf(mode), 1)
              : transportModes.push(mode)"
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

    <!-- Joined Events Modal -->
    <Dialog v-model:open="joinedOpen">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Your Joined Events</DialogTitle>
        </DialogHeader>

        <div v-if="loadingEvents" class="flex items-center justify-center py-10 text-gray-500">
          <Loader2 class="h-6 w-6 animate-spin mr-2 text-blue-600" /> Loading events...
        </div>

        <div v-else>
          <ul v-if="joinedEvents.length" class="divide-y divide-gray-200">
            <li
              v-for="e in joinedEvents"
              :key="e.id"
              class="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p class="font-semibold text-gray-900">{{ e.title }}</p>
                <p class="text-sm text-gray-600">
                  {{ new Date(e.start_date).toLocaleDateString() }} • {{ e.venue }}
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
        </div>
      </DialogContent>
    </Dialog>

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
            class="w-16 h-16 rounded-full cursor-pointer border-2 transition hover:border-blue-500"
            :class="{ 'border-blue-600': profilePicture === src }"
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
  </section>
</template>

<style scoped>
.container { max-width: 1100px; }
</style>


