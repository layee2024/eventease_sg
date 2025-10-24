<script setup>
import { ref, onMounted, computed } from "vue"
import { supabase } from "@/utils/supabase"
import EventCard from "@/components/comp/user/EventCard.vue"

const savedEvents = ref([])
const savedIds = ref([])
const loading = ref(true)
const today = new Date().toISOString()

// Pagination
const currentPage = ref(1)
const eventsPerPage = 8

const totalPages = computed(() =>
  Math.ceil(savedEvents.value.length / eventsPerPage)
)

const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * eventsPerPage
  return savedEvents.value.slice(start, start + eventsPerPage)
})

// Fetch saved events
async function loadSavedEvents() {
  loading.value = true
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    savedEvents.value = []
    loading.value = false
    return
  }

  // Get user's saved events
  const { data: pref, error: prefErr } = await supabase
    .from("user_preferences")
    .select("saved")
    .eq("id", user.id)
    .single()

  if (prefErr) {
    console.error("Error fetching preferences:", prefErr)
    loading.value = false
    return
  }

  savedIds.value = pref?.saved || []

  // Fetch event details
  if (savedIds.value.length === 0) {
    savedEvents.value = []
    loading.value = false
    return
  }

  const { data: events, error: eventErr } = await supabase
    .from("events")
    .select("*")
    .gte("end_date", today)
    .in("id", savedIds.value)

  if (eventErr) {
    console.error("Error fetching saved events:", eventErr)
  } else {
    savedEvents.value = events || []
  }

  loading.value = false
}

// Handle removing from saved
function handleSavedUpdate({ id, liked }) {
  if (!liked) {
    savedEvents.value = savedEvents.value.filter((e) => e.id !== id)
    savedIds.value = savedIds.value.filter((x) => x !== id)

    if (
      (currentPage.value - 1) * eventsPerPage >= savedEvents.value.length &&
      currentPage.value > 1
    ) {
      currentPage.value--
    }
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

onMounted(loadSavedEvents)
</script>

<template>
  <section class="py-12 px-6 md:px-12 xl:px-20 bg-white min-h-screen">
    <div class="flex flex-col mb-8">
      <h2 class="text-3xl font-bold text-gray-900">Saved Events</h2>
      <p class="text-gray-500 mt-2">
        View all the events you've saved for later.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-10 text-gray-500">
      Loading your saved events...
    </div>

    <!-- No saved events -->
    <div v-else-if="!savedEvents.length" class="text-center py-16 text-gray-500">
      <p class="text-lg">You haven't saved any events yet.</p>
      <p class="text-sm text-gray-400 mt-1">
        Explore events and tap the saved icon to save them here!
      </p>
    </div>

    <!-- Saved events grid -->
    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <EventCard
          v-for="event in paginatedEvents"
          :key="event.id"
          :id="event.id"
          :title="event.title"
          :category="event.category"
          :categoryColor="{
            Music: 'bg-purple-600',
            Food: 'bg-orange-500',
            Arts: 'bg-pink-500',
            Tech: 'bg-blue-600',
            Sports: 'bg-green-500',
          }[event.category] || 'bg-gray-500'"
          :location="event.venue || 'Unknown venue'"
          :price="event.ticket_price === 0 ? 'Free' : `$${event.ticket_price}`"
          :date="new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })"
          :crowd="event.crowd_level"
          :image="event.image_url"
          liked
          @update-saved="handleSavedUpdate"
        />
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex justify-center items-center gap-4 mt-8"
      >
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 rounded-md border text-sm font-medium transition-colors duration-200 cursor-pointer"
          :class="currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'"
        >
          Previous
        </button>

        <span class="text-gray-600 text-sm">
          Page {{ currentPage }} of {{ totalPages }}
        </span>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 rounded-md border text-sm font-medium transition-colors duration-200 cursor-pointer"
          :class="currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'"
        >
          Next
        </button>
      </div>
    </div>
  </section>
</template>
