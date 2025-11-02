<script setup>
import { ref, onMounted, computed } from "vue"
import { supabase } from "@/utils/supabase"
import { useRouter } from "vue-router"
import CardShuffle from "@/components/comp/user/CardShuffle.vue"
import EventCard from "@/components/comp/user/EventCard.vue"
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
  const today = new Date().toISOString()
  const { data, error } = await supabase.from("events").select("*").gte("end_date", today) 

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
  const today = new Date().toISOString()
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
  if (!selectedEvent.value || !selectedEvent.value.id) {
    toast.error("No event selected");
    return;
  }

  // Add query param to remember source
  router.push({ path: `/event/${selectedEvent.value.id}`, query: { from: "shuffle" } });
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
  <section class="min-h-screen bg-white dark:bg-[#121212] py-12 px-6 md:px-12 xl:px-20">
    <!-- Header -->
    <div class="max-w-7xl mx-auto mb-12 text-center">
      <div class="flex items-center justify-center gap-3 mb-4">
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white">Shuffle</h1>
      </div>
      <p class="text-xl text-gray-400 max-w-2xl mx-auto">
        Can't decide what to do? Let fate choose your next adventure!<br/>
        Shuffle the cards and discover exciting events tailored to your preferences.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600 dark:text-white">Loading events...</p>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-5xl mx-auto">
      
      <!-- Card Shuffle Component -->
      <div v-if="!showResult" class="mb-12">
        <CardShuffle
        :events="filteredEvents"
        @result="handleShuffleResult"
        />
      </div>

      <!-- Active Filters Display -->
      <div v-if="!showResult && (preferredCategories.length > 0 || maxBudget || preferredCrowdLevel)" class="mb-8">
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

      <!-- Result Card -->
      <div v-if="showResult && selectedEvent" class="max-w-4xl mx-auto">
        <Card class="p-0 border-4 border-sky-400 shadow-2xl bg-white">
          <CardHeader class="bg-sky-400 text-white p-2">
            <CardTitle class="text-3xl text-center flex items-center justify-center gap-3">
              <Sparkles class="w-8 h-8" />
              Your Perfect Event!
              <Sparkles class="w-8 h-8" />
            </CardTitle>
            <CardDescription class="text-white text-center text-lg">
              The cards have chosen! Here's your next adventure:
            </CardDescription>
          </CardHeader>
          <CardContent class="pt-2 pb-6 bg-white rounded-full">
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
                      <Badge 
                        :variant="selectedEvent.crowd_level === 'Low' ? 'default' : 'secondary'"
                        :class="[
                        'px-2 py-1 rounded text-xs font-medium',
                        selectedEvent.crowd_level === 'Low' ? 'bg-green-100 text-green-700' :
                        selectedEvent.crowd_level === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      ]">
                        {{ selectedEvent.crowd_level }}
                      </Badge>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col gap-3 mt-6">
                  <Button @click="saveEvent" size="lg" class="w-full cursor-pointer dark:bg-black dark:text-white">
                    Save This Event
                  </Button>
                  <Button @click="viewEventDetails" size="lg" variant="outline" class="w-full cursor-pointer dark:bg-white dark:text-black">
                    View Full Details
                  </Button>
                  <Button @click="resetShuffle" size="lg" variant="ghost" class="w-full cursor-pointer dark:text-black hover">
                    Shuffle Again
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Help Text -->
      <div class="text-center mt-12 text-gray-600 dark:text-gray-400">
        <p>💡 Tip: Update your preferences in your profile to get more personalized shuffles!</p>
      </div>
    </div>
  </section>
</template>

<style scoped>

</style>
