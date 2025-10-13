<script setup>
import { ref, onMounted } from "vue"
import { supabase } from "@/utils/supabase"
import { useRouter } from "vue-router"
import { Button } from "@/components/ui/button"
import EventCard from "@/components/comp/EventCard.vue"
//for eventfilter.vue file import 
import EventFilter from "@/components/comp/EventFilter.vue"


const trendingEvents = ref([])
const savedIds = ref([]) // user’s saved events
const router = useRouter()
//for filteredevents
const filteredEvents = ref([...trendingEvents.value])

// Get trending events
async function getTrendingEvents() {
  const { data, error } = await supabase.from("events").select("*")
  if (error) {
    console.error("Error fetching trending events:", error)
    return
  }
  // trendingEvents.value = data.filter((x) => x.crowd_level === "High")
  trendingEvents.value=data //keep all the events
}

// Load user's saved list
async function loadUserSaved() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data, error } = await supabase
    .from("preferences")
    .select("saved")
    .eq("id", user.id)
    .single()

  if (error) {
    console.error("Error loading preferences:", error)
    return
  }

  savedIds.value = data?.saved || []
}

// Update saved list
function handleSavedUpdate({ id, liked }) {
  if (liked) {
    if (!savedIds.value.includes(id)) savedIds.value.push(id)
  } else {
    savedIds.value = savedIds.value.filter((x) => x !== id)
  }
}
//function for the event filter 
function handleFilterChange(filter) {
  filteredEvents.value = trendingEvents.value.filter((event) => {
    const matchCategory = filter.category ? event.category === filter.category : true
    const matchPrice = filter.maxPrice != null ? event.ticket_price <= filter.maxPrice : true
    const matchCrowd = filter.crowdLevel ? event.crowd_level === filter.crowdLevel : true
    return matchCategory && matchPrice && matchCrowd
  })
}


const viewAll = () => router.push("/events/trending")

onMounted(async () => {
  await getTrendingEvents()
  filteredEvents.value = [...trendingEvents.value]
  await loadUserSaved()
})

</script>

<template>
  <section class="py-12 px-6 md:px-12 xl:px-20 bg-white">
    <!-- header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-3xl font-bold text-gray-900">Trending Events</h2>
        <p class="text-gray-500 mt-1">What's hot in Singapore right now</p>
      </div>
      <Button
        variant="link"
        class="text-blue-600 font-medium hover:text-blue-700"
        @click="viewAll"
      >
        View All →
      </Button>
    </div>

     <!-- Filter Bar -->
    <EventFilter @update-filter="handleFilterChange" />

    <div
      v-if="filteredEvents.length"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <EventCard
        v-for="event in filteredEvents"
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
        :liked="savedIds.includes(event.id)"
        @update-saved="handleSavedUpdate"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-gray-500 text-center py-10 mt-6">
      No events match the selected filters.
    </div>
  </section>


</template>
