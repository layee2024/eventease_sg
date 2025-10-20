<script setup>
import { ref, onMounted } from "vue"
import { supabase } from "@/utils/supabase"
import EventCard from "@/components/comp/user/EventCard.vue"

const savedEvents = ref([])
const savedIds = ref([])
const loading = ref(true)

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
    .in("id", savedIds.value)
    .gte("end_date", today) 

  if (eventErr) {
    console.error("Error fetching saved events:", eventErr)
  } else {
    savedEvents.value = events || []
  }

  loading.value = false
}

// Update
function handleSavedUpdate({ id, liked }) {
  if (!liked) {
    savedEvents.value = savedEvents.value.filter((e) => e.id !== id)
    savedIds.value = savedIds.value.filter((x) => x !== id)
  }
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
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <EventCard
        v-for="event in savedEvents"
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
  </section>
</template>
