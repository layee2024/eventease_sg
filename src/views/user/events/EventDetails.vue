<script setup>
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { supabase } from "@/utils/supabase"
import { toast } from "vue-sonner"
import { CalendarDays, MapPin, DollarSign, Users, ArrowLeft, Heart } from "lucide-vue-next"
import { Button } from "@/components/ui/button"

const route = useRoute()
const router = useRouter()
const event = ref(null)
const loading = ref(true)
const eventId = route.params.id
const isSaved = ref(false)
const isGoing = ref(false)
const goingCount = ref(0)
const user = ref(null)

// category color mapping
const categoryColor = computed(() => {
  if (!event.value) return "bg-gray-500"
  return (
    {
      Music: "bg-purple-600",
      Food: "bg-orange-500",
      Arts: "bg-pink-500",
      Tech: "bg-blue-600",
      Sports: "bg-green-500",
      Technology: "bg-blue-600",
      Education: "bg-indigo-600",
      Business: "bg-gray-600",
      Culture: "bg-red-500",
      Health: "bg-teal-500",
      Social: "bg-yellow-500",
      Environment: "bg-green-600",
    }[event.value.category] || "bg-gray-500"
  )
})

// Date formatter
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

// Fetch event details
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
  await checkSavedStatus()
  await checkGoingStatus()
  await countGoingUsers()
  loading.value = false
}

// Check if user has saved the event
async function checkSavedStatus() {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) return
  user.value = auth.user

  const { data: pref, error } = await supabase
    .from("user_preferences")
    .select("saved")
    .eq("id", user.value.id)
    .single()

  if (error) return console.error(error)
  isSaved.value = pref?.saved?.includes(eventId) || false
}

// Check if user is going to this event
async function checkGoingStatus() {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) return
  user.value = auth.user

  const { data: pref, error } = await supabase
    .from("user_preferences")
    .select("going")
    .eq("id", user.value.id)
    .single()

  if (error) return console.error(error)
  isGoing.value = pref?.going?.includes(eventId) || false
}

// Count how many users are going
async function countGoingUsers() {
  const { count, error } = await supabase
    .from("user_preferences")
    .select("id", { count: "exact", head: true })
    .contains("going", [eventId])

  if (!error) goingCount.value = count || 0
}

// Toggle save
async function toggleSave() {
  if (!user.value) {
    toast.error("Please login to save events")
    return
  }

  isSaved.value = !isSaved.value
  const { data: pref } = await supabase
    .from("user_preferences")
    .select("saved")
    .eq("id", user.value.id)
    .single()

  let updated = pref?.saved || []
  if (isSaved.value) {
    if (!updated.includes(eventId)) updated.push(eventId)
    toast.success(`${event.value.title} added to saved events`)
  } else {
    updated = updated.filter((id) => id !== eventId)
    toast.info(`${event.value.title} removed from saved events`)
  }

  await supabase
    .from("user_preferences")
    .update({ saved: updated })
    .eq("id", user.value.id)
}

// Join or leave event
async function toggleJoinEvent() {
  if (!user.value) {
    toast.error("Please login to join events")
    return
  }

  const { data: pref } = await supabase
    .from("user_preferences")
    .select("going")
    .eq("id", user.value.id)
    .single()

  let updated = pref?.going || []
  if (isGoing.value) {
    updated = updated.filter((id) => id !== eventId)
    toast.info(`You left ${event.value.title}`)
  } else {
    if (!updated.includes(eventId)) updated.push(eventId)
    toast.success(`You joined ${event.value.title}!`)
  }

  await supabase
    .from("user_preferences")
    .update({ going: updated })
    .eq("id", user.value.id)

  isGoing.value = !isGoing.value
  await countGoingUsers()
}

onMounted(fetchEvent)
</script>

<template>
  <section class="min-h-min">
    <div v-if="loading" class="flex justify-center items-center h-[80vh]">
      <div class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    </div>

    <div v-else-if="event" class="relative max-w-5xl mx-auto bg-white shadow-md rounded-lg overflow-hidden my-10">
      <!-- Back Button -->
      <Button
        variant="outline"
        @click="router.push('/events')"
        class="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md shadow-sm hover:bg-gray-200 cursor-pointer"
      >
        <ArrowLeft class="w-4 h-4" /> Back
      </Button>

      <!-- Header Image -->
      <div class="relative">
        <img :src="event.image_url" alt="Event banner" class="w-full h-72 object-cover" />
        <div
          class="absolute top-4 right-4 text-white text-sm font-medium px-3 py-1 rounded-lg shadow-sm"
          :class="categoryColor"
        >
          {{ event.category }}
        </div>
      </div>

      <!-- Content -->
      <div class="p-8">
        <!-- Title & Save Button -->
        <div class="flex items-start justify-between mb-4">
          <h1 class="text-3xl font-extrabold text-gray-900">
            {{ event.title }}
          </h1>

          <button
            @click="toggleSave"
            class="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
          >
            <Heart
              :class="[
                'w-5 h-5 transition',
                isSaved ? 'fill-red-500 text-red-500' : 'fill-none text-gray-600'
              ]"
            />
            <span class="text-sm font-medium text-gray-700">
              {{ isSaved ? "Saved" : "Save" }}
            </span>
          </button>
        </div>

        <!-- Description -->
        <p class="text-gray-600 text-lg leading-relaxed mb-8">
          {{ event.description }}
        </p>

        <!-- Info Blocks -->
        <div class="grid md:grid-cols-2 gap-6">
          <div class="bg-gray-50 rounded-xl p-5 space-y-5 border border-gray-100">
            <div class="flex items-start gap-3 text-gray-800">
              <CalendarDays class="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p class="font-semibold">Date & Time</p>
                <p class="text-gray-600 text-sm">{{ formatDate(event.start_date, event.end_date) }}</p>
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
                <p class="text-gray-600 text-sm">{{ event.crowd_level || "N/A" }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Going Button -->
        <div class="mt-8 flex items-center justify-between">
          <p class="text-blue-600 font-medium">
            {{ goingCount }} {{ goingCount === 1 ? "person is" : "people are" }} going
          </p>
          <Button
            class="cursor-pointer"
            :variant="isGoing ? 'secondary' : 'default'"
            @click="toggleJoinEvent"
          >
            {{ isGoing ? "Leave Event" : "Join Event" }}
          </Button>
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
      <Button @click="router.push('/events')" variant="outline" class="mt-4">
        Back to Events
      </Button>
    </div>
  </section>
</template>
