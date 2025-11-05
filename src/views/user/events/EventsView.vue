<script setup>
import { ref, onMounted, computed, watch } from "vue"
import { supabase } from "@/utils/supabase"
import { useRouter, useRoute } from "vue-router"
import { Button } from "@/components/ui/button"
import EventCard from "@/components/comp/user/EventCard.vue"
import EventFilter from "@/components/comp/user/EventFilter.vue"
import ReviewPreview from "@/components/comp/user/ReviewPreview.vue"
import { userLocation, fetchUserLocation } from './location.js'

//  Fetch the event
const event = ref(null)
const route = useRoute()
const allLoading = ref(true)

onMounted(async () => {
  {
    await fetchUserLocation() // fetch location once
    
  }
})
// //  Get lat/lng from query
// const userLocation = computed(() => {
//   const lat = parseFloat(route.query.lat)
//   const lng = parseFloat(route.query.lng)
//   if (isNaN(lat) || isNaN(lng)) return null
//   return { lat, lng }
// })

const router = useRouter()
const trendingEvents = ref([])
const filteredEvents = ref([])
const savedIds = ref([])

// Pagination state
const currentPage = ref(1)
const itemsPerPage = 20

// Total pages
const totalPages = computed(() =>
  Math.ceil(filteredEvents.value.length / itemsPerPage)
)

//haversine distance function (return km)
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Helper: calculate distance safely for one event
function getEventDistance(event) {
  if (!userLocation.value || !event.latitude || !event.longitude) return null
  return Number(
    getDistanceKm(
    userLocation.value.lat,
    userLocation.value.lng,
    parseFloat(event.latitude),
    parseFloat(event.longitude)
  )
)
}

const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredEvents.value.slice(start, end)
})

// Fetch all events
async function getTrendingEvents() {
  const today = new Date().toISOString()
  const { data, error } = await supabase.from("events")
  .select("*")
  .gte("end_date", today) 
  
  if (error) {
    console.error("Error fetching events:", error)
    return
  }
  trendingEvents.value = data || []
  filteredEvents.value = [...trendingEvents.value]

}

// Load user's saved list
async function loadUserSaved() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { data, error } = await supabase
    .from("user_preferences")
    .select("saved")
    .eq("id", user.id)
    .single()
  if (!error && data) savedIds.value = data.saved || []
}

// Update saved list in state
function handleSavedUpdate({ id, liked }) {
  savedIds.value = liked
    ? [...new Set([...savedIds.value, id])]
    : savedIds.value.filter((x) => x !== id)
}


// Handle filters
function handleFilterChange(filter) {
  //filter first 
  let result = trendingEvents.value.filter((event) => {
    const matchCategory = !filter.category || event.category === filter.category
    const matchPrice =
      filter.maxPrice == null ||
      isNaN(filter.maxPrice) ||
      event.ticket_price <= filter.maxPrice
    const matchCrowd =
      !filter.crowdLevel || event.crowd_level === filter.crowdLevel
    const matchSearch =
      !filter.searchQuery ||
      event.title.toLowerCase().includes(filter.searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(filter.searchQuery.toLowerCase())
    return matchCategory && matchPrice && matchCrowd && matchSearch
  })
  //apply sorting here
   if (filter.sortOption) {
    if (filter.sortOption === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title))
    } else if (filter.sortOption === "priceLow") {
      result.sort((a, b) => a.ticket_price - b.ticket_price)
    } else if (filter.sortOption === "priceHigh") {
      result.sort((a, b) => b.ticket_price - a.ticket_price)
    } else if (filter.sortOption === "date") {
      result.sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    } else if (filter.sortOption === "distance" ) {
        if (userLocation.value) {
          result.sort((a, b) => {
            const distA = getEventDistance(a) ?? Infinity
            const distB = getEventDistance(b) ?? Infinity
            return distA - distB
      })
    }
  }
  }

  //update results 
  filteredEvents.value = result
  // Reset to page 1 on filter change
  currentPage.value = 1 
}


// Pagination controls
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
  window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--
  window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
}

function applySearchFilter(query) {
  const q = query.toLowerCase()
  filteredEvents.value = trendingEvents.value.filter(
    (event) =>
      event.title.toLowerCase().includes(q) ||
      event.category?.toLowerCase().includes(q) ||
      event.venue?.toLowerCase().includes(q)
  )
  currentPage.value = 1
}
watch(
  () => route.query.search,
  (newQuery) => {
    if (newQuery && trendingEvents.value.length) {
      applySearchFilter(newQuery)
    }
  },
  { immediate: true }
)


onMounted(async () => {
  allLoading.value = true
  
  await getTrendingEvents()
  await loadUserSaved()

  const initialQuery = route.query.search
  if (initialQuery) applySearchFilter(initialQuery)

  allLoading.value = false
})
</script>

<template>
  <section class="min-h-screen py-12 px-6 md:px-12 xl:px-20 bg-white dark:bg-[#121212]">
    <!-- Header -->
    <div class="text-center mb-10">
      <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white">Events</h1>
      <p class="text-lg text-gray-400 mt-2">
        Discover upcoming events happening across Singapore
      </p>
    </div>

    <!-- Filter Bar -->
    <div class="flex justify-center mb-8">
      <EventFilter 
        :initial-search="route.query.search || ''"
        @update-filter="handleFilterChange" 
      />
    </div>

    <!-- Events -->
    <div
      v-if="paginatedEvents.length"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
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
        :date="new Date(event.start_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })"
        :crowd="event.crowd_level"
        :image="event.image_url"
        :liked="savedIds.includes(event.id)"
        :distance="getEventDistance(event)"
        :parentLoading="allLoading"
        :maxCapacity="event.max_capacity"
        @update-saved="handleSavedUpdate"
      />

    

    </div>

    <!-- Empty State -->
    <div v-else class="text-gray-500 text-center py-10 mt-6">
      No events match the selected filters.
    </div>

    <div
      v-if="totalPages > 1"
      class="flex flex-col items-center justify-center mt-10"
    >
      <!-- Pagination -->
      <div
        class="flex flex-col md:gap-3 text-sm text-gray-600 dark:text-white w-full text-center"
      >
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

        <div
          class="text-gray-500 dark:text-white text-xs md:text-sm mt-1 md:mt-0 md:ml-2"
        >
          Showing
          {{ (currentPage - 1) * itemsPerPage + 1 }}
          -
          {{ Math.min(currentPage * itemsPerPage, filteredEvents.length) }}
          of
          {{ filteredEvents.length }}
          events
        </div>
      </div>
    </div>
  </section>
</template>
