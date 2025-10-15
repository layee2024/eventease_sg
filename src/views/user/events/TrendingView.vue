<script setup>
    import { ref, onMounted } from "vue"
    import EventCard from "@/components/comp/EventCard.vue"
    import { supabase } from "@/utils/supabase"

    const trendingEvents = ref([])

    async function getTrendingEvents() {
    const { data, error } = await supabase.from("events").select("*")
    if (error) {
        console.error("Error fetching trending events:", error)
        return
    }
    trendingEvents.value = data.filter((x) => x.crowd_level === "High")
    }

    onMounted(getTrendingEvents)
</script>

<template>
  <section class="py-12 px-6 md:px-12 xl:px-20 bg-white min-h-screen">
    <h1 class="text-4xl font-bold text-gray-900 mb-2">🔥 All Trending Events</h1>
    <p class="text-gray-500 mb-8">Discover what’s trending across Singapore</p>

    <div
      v-if="trendingEvents.length"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <EventCard
        v-for="event in trendingEvents"
        :key="event.id"
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
      />
    </div>

    <div v-else class="text-gray-500 text-center py-10">
      No trending events found.
    </div>
  </section>
</template>
