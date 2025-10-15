<script setup>
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { supabase } from "@/utils/supabase"
import { toast } from "vue-sonner"
import { CalendarDays, MapPin, DollarSign, Users, ArrowLeft } from "lucide-vue-next"
import { Button } from "@/components/ui/button"

const route = useRoute()
const router = useRouter()
const event = ref(null)
const loading = ref(true)
const eventId = route.params.id

function formatDate(start, end) {
  if (!start || !end) return "TBA"

  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }

  const startStr = new Intl.DateTimeFormat("en-SG", options).format(new Date(start))
  const endTime = new Intl.DateTimeFormat("en-SG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(end))

  return `${startStr} - ${endTime}`
}

// Fetch event by ID
async function fetchEvent() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .maybeSingle()

  if (error || !data) {
    console.error(error)
    toast.error("Event not found")
    loading.value = false
    return
  }

  event.value = data
  loading.value = false
}

onMounted(fetchEvent)
</script>

<template>
  <section class="min-h-min">
    <div v-if="loading" class="flex justify-center items-center h-[80vh]">
      <div class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    </div>

    <div
      v-else-if="event"
      class="relative max-w-5xl mx-auto bg-white shadow-md rounded-lg overflow-hidden my-10"
    >
      <!-- Back Button -->
      <Button
        variant="outline"
        @click="router.push('/events')"
        class="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md shadow-sm hover:bg-gray-200 cursor-pointer"
      >
        <ArrowLeft class="w-4 h-4" /> Back to Events
      </Button>

      <!-- Header Image -->
      <div class="relative">
        <img
          :src="event.image_url"
          alt="Event banner"
          class="w-full h-72 object-cover"
        />
        <div
          class="absolute top-4 right-4 bg-white text-gray-700 px-3 py-1 rounded-lg text-sm font-medium shadow-sm"
        >
          {{ event.category }}
        </div>
      </div>

      <!-- Content -->
      <div class="p-8">
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between mb-6 gap-3">
          <h1 class="text-3xl font-extrabold text-gray-900">
            {{ event.title }}
          </h1>
        </div>

        <!-- Description -->
        <p class="text-gray-600 text-lg leading-relaxed mb-8">
          {{ event.description }}
        </p>

        <!-- Grouped Info Blocks -->
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Time & Location -->
          <div class="bg-gray-50 rounded-xl p-5 space-y-5 border border-gray-100">
            <div class="flex items-start gap-3 text-gray-800">
              <CalendarDays class="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p class="font-semibold">Date & Time</p>
                <p class="text-gray-600 text-sm">
                  {{ formatDate(event.start_date, event.end_date) }}
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3 text-gray-800">
              <MapPin class="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p class="font-semibold">Location</p>
                <p class="text-gray-600 text-sm">{{ event.venue }}</p>
              </div>
            </div>
          </div>

          <!-- Price & Crowd -->
          <div class="bg-gray-50 rounded-xl p-5 space-y-5 border border-gray-100">
            <div class="flex items-start gap-3 text-gray-800">
              <DollarSign class="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p class="font-semibold">Price</p>
                <p class="text-gray-600 text-sm">
                  {{ event.ticket_price === 0 ? "Free" : `$${event.ticket_price}` }}
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3 text-gray-800">
              <Users class="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p class="font-semibold">Crowd Level</p>
                <p class="text-gray-600 text-sm">
                  {{ event.crowd_level || "N/A" }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Map -->
        <div class="mt-10 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <iframe
            v-if="event.latitude && event.longitude"
            :src="`https://www.google.com/maps?q=${event.latitude},${event.longitude}&hl=en&z=15&output=embed`"
            width="100%"
            height="350"
            allowfullscreen
            loading="lazy"
            class="rounded-xl"
          ></iframe>
          <div
            v-else
            class="flex items-center justify-center h-64 bg-gray-100 text-gray-500"
          >
            Map unavailable
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20 text-gray-600">
      <p>Event not found.</p>
      <Button
        @click="router.push('/events')"
        variant="outline"
        class="mt-4"
      >
        Back to Events
      </Button>
    </div>
  </section>
</template>
