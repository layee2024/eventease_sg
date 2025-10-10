<script setup>
  import { ref, onMounted } from "vue"
  import EventCard from "@/components/comp/EventCard.vue"
  import { Button } from "@/components/ui/button"
  import { Spinner } from "@/components/ui/spinner"
  import { supabase } from "../utils/supabase"

  const events = ref([])
  const loading = ref(true)

  const categoryColors = {
    Music: "bg-purple-600",
    Food: "bg-orange-500",
    Arts: "bg-pink-500",
    Tech: "bg-blue-600",
    Sports: "bg-green-500",
    Default: "bg-gray-500",
  }

  async function getEvents() {
    const startTime = Date.now()

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("start_date", { ascending: true })

    const elapsed = Date.now() - startTime
    const minDelay = 750

    if (error) {
      console.error("Error fetching events:", error)
      loading.value = false
      return
    }

    events.value = data.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      categoryColor: categoryColors[e.category] || categoryColors.Default,
      location: e.venue || "Unknown venue",
      price: e.ticket_price === 0 ? "Free" : `$${e.ticket_price}`,
      date: formatDateRange(e.start_date, e.end_date),
      crowd: e.crowd_level || "Moderate",
      image: e.image_url || "/assets/placeholder.jpg",
      liked: false,
    }))

    const remaining = Math.max(0, minDelay - elapsed)
    setTimeout(() => {
      loading.value = false
    }, remaining)
  }

  function formatDateRange(start, end) {
    if (!start) return ""
    const startDate = new Date(start)
    const endDate = end ? new Date(end) : null

    const startMonth = startDate.toLocaleString("en-US", { month: "short" })
    const startDay = startDate.getDate()
    if (!endDate) return `${startMonth} ${startDay}`

    const endMonth = endDate.toLocaleString("en-US", { month: "short" })
    const endDay = endDate.getDate()

    return `${startMonth} ${startDay}-${endMonth} ${endDay}`
  }

  onMounted(getEvents)
</script>

<template>
  <section class="py-16 px-6 md:px-12 xl:px-20 bg-white">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-3xl font-bold text-gray-900">Trending Events</h2>
        <p class="text-gray-500 mt-1">What's hot in Singapore right now</p>
      </div>
      <Button variant="link" class="text-blue-600 font-medium hover:text-blue-700">
        View All →
      </Button>
    </div>

    <!-- Event Cards Grid -->
    <div v-if="!loading && events.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <EventCard v-for="event in events" :key="event.id" v-bind="event" />
    </div>

    <!-- Spinner -->
    <div v-else class="text-center py-10 flex justify-center">
      <Spinner class="size-8" />
    </div>
  </section>
</template>
