<script setup>
import { ref, onMounted, computed } from "vue"
import { supabase } from "@/utils/supabase"
import { useRouter } from "vue-router"
import CardShuffle from "@/components/comp/CardShuffle.vue"
import EventCard from "@/components/comp/EventCard.vue"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Sparkles, TrendingUp, DollarSign, Users, Shuffle } from "lucide-vue-next"
import { toast } from "vue-sonner"

const router = useRouter()

const allEvents = ref([])
const filteredEvents = ref([])
const selectedEvent = ref(null)
const userPreferences = ref(null)
const savedIds = ref([])
const loading = ref(true)
const showResult = ref(false)

// User preference filters
const preferredCategories = ref([])
const maxBudget = ref(null)
const preferredCrowdLevel = ref(null)

// Fetch all events from Supabase
async function fetchEvents() {
  const { data, error } = await supabase.from("events").select("*")

  if (error) {
    console.error("Error fetching events:", error)
    toast.error("Failed to load events")
    return
  }

  allEvents.value = data || []
}

// Load user preferences
async function loadUserPreferences() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // If not logged in, use all events
    filteredEvents.value = [...allEvents.value]
    loading.value = false
    return
  }

  const { data: pref, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("id", user.id)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Error loading preferences:", error)
  }

  if (pref) {
    userPreferences.value = pref
    savedIds.value = pref.saved || []

    // Extract preferences for filtering
    preferredCategories.value = pref.interests || []
    maxBudget.value = pref.max_budget || null
    preferredCrowdLevel.value = pref.preferred_crowd_level || null
  }

  applyFilters()
  loading.value = false
}

// Apply intelligent filtering based on user preferences
function applyFilters() {
  if (!allEvents.value.length) {
    filteredEvents.value = []
    return
  }

  let filtered = [...allEvents.value]

  // Filter by preferred categories if set
  if (preferredCategories.value && preferredCategories.value.length > 0) {
    filtered = filtered.filter(event =>
      preferredCategories.value.includes(event.category)
    )
  }

  // Filter by budget if set
  if (maxBudget.value !== null && maxBudget.value > 0) {
    filtered = filtered.filter(event =>
      event.ticket_price <= maxBudget.value
    )
  }

  // Filter by preferred crowd level if set
  if (preferredCrowdLevel.value) {
    filtered = filtered.filter(event =>
      event.crowd_level === preferredCrowdLevel.value
    )
  }

  // If filters are too restrictive and result in no events, use all events
  if (filtered.length === 0) {
    toast.info("No events match your exact preferences. Showing all events!")
    filtered = [...allEvents.value]
  }

  // Shuffle for randomness
  filteredEvents.value = shuffleArray(filtered)
}

// Shuffle array for randomness
function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Handle shuffle result
function handleShuffleResult(event) {
  selectedEvent.value = event
  showResult.value = true

  toast.success(`You got: ${event.title}!`, {
    duration: 5000,
  })
}

// Save selected event
async function saveEvent() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    toast.error("Please login to save events")
    router.push("/login")
    return
  }

  if (!savedIds.value.includes(selectedEvent.value.id)) {
    savedIds.value.push(selectedEvent.value.id)

    await supabase
      .from("user_preferences")
      .update({ saved: savedIds.value })
      .eq("id", user.id)

    toast.success("Event saved to your list!")
  } else {
    toast.info("Event already saved!")
  }
}

// View event details
function viewEventDetails() {
  // You can implement a detailed event view page later
  toast.info("Event details page coming soon!")
}

// Go to preferences to customize filters
function goToPreferences() {
  router.push("/profile")
}

// Reset and shuffle again
function resetShuffle() {
  showResult.value = false
  selectedEvent.value = null
  applyFilters() // Re-shuffle events
}

// Stats for display
const stats = computed(() => ({
  totalEvents: allEvents.value.length,
  matchingEvents: filteredEvents.value.length,
  categoriesSelected: preferredCategories.value.length || "All",
  budgetLimit: maxBudget.value ? `$${maxBudget.value}` : "Any"
}))

onMounted(async () => {
  await fetchEvents()
  await loadUserPreferences()
})

// Update saved list handler
function handleSavedUpdate({ id, liked }) {
  if (liked) {
    if (!savedIds.value.includes(id)) savedIds.value.push(id)
  } else {
    savedIds.value = savedIds.value.filter((x) => x !== id)
  }
}
</script>

<template>
  <section class="min-h-screen bg-white py-12 px-6 md:px-12 xl:px-20">
    <!-- Header -->
    <div class="max-w-7xl mx-auto mb-12 text-center">
      <div class="flex items-center justify-center gap-3 mb-4">
        <Shuffle class="w-12 h-12 text-blue-600 animate-pulse" />
        <h1 class="text-5xl font-extrabold text-gray-900">Shuffle & Discover</h1>
        <Shuffle class="w-12 h-12 text-blue-600 animate-pulse" />
      </div>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        Can't decide what to do? Let fate choose your next adventure!
        Shuffle the cards and discover exciting events tailored to your preferences.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading events...</p>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-7xl mx-auto">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <Card>
          <CardContent class="p-4 flex items-center gap-3">
            <div class="p-3 bg-blue-100 rounded-lg">
              <TrendingUp class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Total Events</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalEvents }}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-4 flex items-center gap-3">
            <div class="p-3 bg-green-100 rounded-lg">
              <Sparkles class="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Matching Events</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.matchingEvents }}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-4 flex items-center gap-3">
            <div class="p-3 bg-purple-100 rounded-lg">
              <Users class="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Categories</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.categoriesSelected }}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-4 flex items-center gap-3">
            <div class="p-3 bg-orange-100 rounded-lg">
              <DollarSign class="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Max Budget</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.budgetLimit }}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Active Filters Display -->
      <div v-if="preferredCategories.length > 0 || maxBudget || preferredCrowdLevel" class="mb-8">
        <Card>
          <CardHeader>
            <CardTitle class="text-lg flex items-center gap-2">
              <Settings class="w-5 h-5" />
              Active Filters
            </CardTitle>
          </CardHeader>
          <CardContent class="flex flex-wrap gap-2 items-center">
            <Badge v-for="cat in preferredCategories" :key="cat" variant="secondary">
              {{ cat }}
            </Badge>
            <Badge v-if="maxBudget" variant="secondary">
              Budget: ${{ maxBudget }}
            </Badge>
            <Badge v-if="preferredCrowdLevel" variant="secondary">
              Crowd: {{ preferredCrowdLevel }}
            </Badge>
            <Button @click="goToPreferences" size="sm" variant="link" class="ml-auto cursor-pointer">
              Edit Preferences →
            </Button>
          </CardContent>
        </Card>
      </div>

      <!-- Card Shuffle Component -->
      <div v-if="!showResult" class="mb-12">
        <CardShuffle
          :events="filteredEvents"
          @result="handleShuffleResult"
        />
      </div>

      <!-- Result Card -->
      <div v-if="showResult && selectedEvent" class="max-w-4xl mx-auto">
        <Card class="border-4 border-yellow-400 shadow-2xl">
          <CardHeader class="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
            <CardTitle class="text-3xl text-center flex items-center justify-center gap-3">
              <Sparkles class="w-8 h-8" />
              Your Perfect Event!
              <Sparkles class="w-8 h-8" />
            </CardTitle>
            <CardDescription class="text-white text-center text-lg">
              The cards have chosen! Here's your next adventure:
            </CardDescription>
          </CardHeader>
          <CardContent class="p-8">
            <div class="grid lg:grid-cols-2 gap-8">
              <!-- Event Card -->
              <div>
                <EventCard
                  :id="selectedEvent.id"
                  :title="selectedEvent.title"
                  :category="selectedEvent.category"
                  :categoryColor="{
                    Music: 'bg-purple-600',
                    Food: 'bg-orange-500',
                    Arts: 'bg-pink-500',
                    Tech: 'bg-blue-600',
                    Technology: 'bg-blue-600',
                    Sports: 'bg-green-500',
                    Education: 'bg-indigo-600',
                    Business: 'bg-gray-600',
                    Culture: 'bg-red-500',
                    Health: 'bg-teal-500',
                    Social: 'bg-yellow-500',
                    Environment: 'bg-green-600'
                  }[selectedEvent.category] || 'bg-gray-500'"
                  :location="selectedEvent.venue || 'Unknown venue'"
                  :price="selectedEvent.ticket_price === 0 ? 'Free' : `$${selectedEvent.ticket_price}`"
                  :date="new Date(selectedEvent.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })"
                  :crowd="selectedEvent.crowd_level"
                  :image="selectedEvent.image_url"
                  :liked="savedIds.includes(selectedEvent.id)"
                  @update-saved="handleSavedUpdate"
                />
              </div>

              <!-- Event Details -->
              <div class="flex flex-col justify-between">
                <div>
                  <h3 class="text-2xl font-bold text-gray-900 mb-4">{{ selectedEvent.title }}</h3>
                  <p class="text-gray-600 mb-6">{{ selectedEvent.description || "An exciting event you won't want to miss!" }}</p>

                  <div class="space-y-3 text-sm">
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-gray-700">Date:</span>
                      <span class="text-gray-600">
                        {{ new Date(selectedEvent.start_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-gray-700">Location:</span>
                      <span class="text-gray-600">{{ selectedEvent.venue }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-gray-700">Price:</span>
                      <span class="text-gray-600">
                        {{ selectedEvent.ticket_price === 0 ? 'Free' : `$${selectedEvent.ticket_price}` }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-gray-700">Crowd Level:</span>
                      <Badge :variant="selectedEvent.crowd_level === 'Low' ? 'default' : 'secondary'">
                        {{ selectedEvent.crowd_level }}
                      </Badge>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col gap-3 mt-6">
                  <Button @click="saveEvent" size="lg" class="w-full">
                    Save This Event
                  </Button>
                  <Button @click="viewEventDetails" size="lg" variant="outline" class="w-full">
                    View Full Details
                  </Button>
                  <Button @click="resetShuffle" size="lg" variant="ghost" class="w-full">
                    Shuffle Again
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Help Text -->
      <div class="text-center mt-12 text-gray-600">
        <p>💡 Tip: Update your preferences in your profile to get more personalized shuffles!</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Additional custom animations */
</style>
