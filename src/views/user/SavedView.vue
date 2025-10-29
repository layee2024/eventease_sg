<script setup>
import { ref, onMounted, computed } from "vue"
import { supabase } from "@/utils/supabase"
import EventCard from "@/components/comp/user/EventCard.vue"
import { Button } from "@/components/ui/button"

const savedEvents = ref([])
const savedIds = ref([])
const loading = ref(true)
const today = new Date().toISOString()

// Pagination
const currentPage = ref(1)
const eventsPerPage = 20

const totalPages = computed(() =>
  Math.ceil(savedEvents.value.length / eventsPerPage)
)

const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * eventsPerPage
  const end = start + eventsPerPage
  return savedEvents.value.slice(start, end)
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

// Pagination controls
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
  }
}

onMounted(loadSavedEvents)
</script>

<template>
  <section class="py-12 px-6 md:px-12 xl:px-20 bg-white dark:bg-[#121212] min-h-screen">
    <div class="flex flex-col mb-8 items-center">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Saved Events</h2>
      <p class="text-gray-400 mt-2">
        View all the events you've saved for later
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-10 text-gray-500 dark:text-white">
      Loading your saved events...
    </div>

    <!-- No saved events -->
    <div v-else-if="!savedEvents.length" class="text-center py-16 text-gray-500 dark:text-white">
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
        class="flex flex-col items-center justify-center mt-10"
      >
        <div class="flex flex-col md:gap-3 text-sm text-gray-600 dark:text-white w-full text-center">
          <!-- Buttons -->
          <div class="flex items-center justify-center gap-3 mb-2 md:mb-0">
            <Button
              variant="outline"
              :disabled="currentPage === 1"
              @click="prevPage"
              class="cursor-pointer"
            >
              Previous
            </Button>

            <span class="text-gray-700 dark:text-white font-medium">
              Page {{ currentPage }} of {{ totalPages }}
            </span>

            <Button
              variant="outline"
              :disabled="currentPage === totalPages"
              @click="nextPage"
              class="cursor-pointer"
            >
              Next
            </Button>
          </div>

          <div class="text-gray-500 dark:text-white text-xs md:text-sm mt-1 md:mt-0 md:ml-2">
            Showing
            {{ (currentPage - 1) * eventsPerPage + 1 }}
            -
            {{ Math.min(currentPage * eventsPerPage, savedEvents.length) }}
            of
            {{ savedEvents.length }}
            events
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
