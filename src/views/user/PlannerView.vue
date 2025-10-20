<script setup>
import { ref, computed, onMounted, watch } from "vue"
import { supabase } from "@/utils/supabase"

const loading = ref(true)
const error = ref("")
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const events = ref([])

const TIME_SLOTS = [
  {
    id: "morning",
    label: "Morning",
    startHour: 6,
    endHour: 11,
    accent: "bg-sky-100 text-sky-700",
  },
  {
    id: "lunch",
    label: "Lunch",
    startHour: 11,
    endHour: 14,
    accent: "bg-amber-100 text-amber-700",
  },
  {
    id: "afternoon",
    label: "Afternoon",
    startHour: 14,
    endHour: 17,
    accent: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "evening",
    label: "Late Afternoon",
    startHour: 17,
    endHour: 21,
    accent: "bg-violet-100 text-violet-700",
  },
]

const formattedDateLabel = computed(() => {
  const date = new Date(`${selectedDate.value}T00:00:00`)
  return date.toLocaleDateString("en-SG", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
})

const friendlyDateShort = computed(() => {
  const date = new Date(`${selectedDate.value}T00:00:00`)
  return date.toLocaleDateString("en-SG", {
    month: "short",
    day: "numeric",
  })
})

const slotPlans = computed(() => {
  const plans = TIME_SLOTS.map((slot) => ({ ...slot, event: null }))
  const sorted = [...events.value].sort(
    (a, b) => new Date(a.start_date) - new Date(b.start_date)
  )

  for (const event of sorted) {
    const startHour = new Date(event.start_date).getHours()
    const slot = plans.find(
      (candidate) =>
        startHour >= candidate.startHour && startHour < candidate.endHour
    )
    if (slot && !slot.event) slot.event = event
  }

  return plans
})

const hasAnyEvents = computed(() => events.value.length > 0)

const curatedCount = computed(
  () => slotPlans.value.filter((slot) => slot.event).length
)

const heroMessage = computed(() => {
  if (loading.value) return "Hold tight, we're crafting your day plan..."
  if (!hasAnyEvents.value)
    return "We couldn't find events for this day. Try a different date."
  return `Here's a curated plan with ${curatedCount.value} ${
    curatedCount.value === 1 ? "experience" : "experiences"
  } to explore.`
})

function formatTimeRange(event) {
  if (!event?.start_date) return "Time TBC"
  const start = new Date(event.start_date)
  const end = event.end_date ? new Date(event.end_date) : null
  const startLabel = start.toLocaleTimeString("en-SG", {
    hour: "numeric",
    minute: "2-digit",
  })
  if (!end) return startLabel
  const endLabel = end.toLocaleTimeString("en-SG", {
    hour: "numeric",
    minute: "2-digit",
  })
  return `${startLabel} - ${endLabel}`
}

function formatPrice(price) {
  if (price === null || price === undefined) return "Pricing TBC"
  if (Number(price) === 0) return "Free"
  return `$${Number(price).toFixed(2)}`
}

async function fetchPlan(dateString) {
  loading.value = true
  error.value = ""

  try {
    const start = new Date(`${dateString}T00:00:00`)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)

    const { data, error: fetchError } = await supabase
      .from("events")
      .select("*")
      .gte("start_date", start.toISOString())
      .lt("start_date", end.toISOString())
      .order("start_date", { ascending: true })
      .limit(40)

    if (fetchError) throw fetchError
    events.value = data || []
  } catch (err) {
    console.error("Failed to load planner events", err)
    error.value =
      "We couldn't load events for this day. Please try again later."
    events.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPlan(selectedDate.value)
})

watch(selectedDate, (next) => {
  fetchPlan(next)
})
</script>

<template>
  <section class="min-h-screen bg-white py-14 px-6 md:px-12 xl:px-20">
    <div class="max-w-6xl mx-auto space-y-12 text-center">
      <!-- Heading -->
      <div class="space-y-4">
        <h1 class="text-4xl font-extrabold text-gray-900">
          AI Assistant Planner
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          The AI assistant helps you plan activities, recommend events, and
          balance your day with smart, conversation-ready suggestions.
        </p>
        <div
          class="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 sm:flex-wrap"
        >
          <label
            class="text-sm font-medium text-gray-700"
            for="planner-date"
          >
            Plan a day for
          </label>
          <input
            id="planner-date"
            v-model="selectedDate"
            type="date"
            class="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <span class="text-sm text-gray-500">
            Latest picks for {{ formattedDateLabel }}
          </span>
        </div>
      </div>

      <div class="flex justify-center">
        <div class="relative w-full max-w-4xl">
          <div
            class="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-100 via-white to-transparent blur-3xl"
          ></div>
          <div
            class="rounded-[2.5rem] border border-gray-200 bg-white shadow-2xl p-8 space-y-6"
          >
            <div class="flex items-center gap-4 flex-wrap justify-center sm:justify-between">
              <div class="flex items-center gap-4">
                <div
                  class="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl"
                >
                  🤖
                </div>
                <div class="text-left">
                  <p class="text-sm font-semibold text-indigo-600 uppercase">
                    AI Itinerary Planner
                  </p>
                  <h2 class="text-2xl font-semibold text-gray-900">
                    Plan {{ friendlyDateShort }}
                  </h2>
                </div>
              </div>
              <span class="text-sm text-gray-500">
                Curated from Supabase events
              </span>
            </div>

            <div
              class="rounded-2xl bg-indigo-50 text-indigo-700 px-5 py-4 text-sm leading-relaxed"
            >
              {{ heroMessage }}
            </div>

            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div
                v-for="slot in slotPlans"
                :key="slot.id"
                class="rounded-2xl border border-gray-200 bg-white/90 p-5 shadow-sm flex flex-col gap-3"
              >
                <div class="flex items-center justify-between">
                  <span
                    class="text-[0.65rem] font-semibold uppercase tracking-wide px-3 py-1 rounded-full"
                    :class="slot.accent"
                  >
                    {{ slot.label }}
                  </span>
                  <span class="text-xs text-gray-400"> Curated pick </span>
                </div>

                <div v-if="slot.event" class="space-y-2">
                  <p class="text-base font-semibold text-gray-900 leading-snug">
                    {{ slot.event.title }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ slot.event.venue || "Venue to be confirmed" }}
                  </p>
                  <div class="flex items-center justify-between text-sm">
                    <span class="font-medium text-gray-900">
                      {{ formatPrice(slot.event.ticket_price) }}
                    </span>
                    <span class="text-gray-600">
                      {{ formatTimeRange(slot.event) }}
                    </span>
                  </div>
                  <RouterLink
                    :to="`/event/${slot.event.id}`"
                    class="inline-flex items-center justify-center rounded-xl bg-indigo-600 text-white text-sm font-medium px-4 py-2 hover:bg-indigo-700 transition"
                  >
                    View event
                  </RouterLink>
                </div>

                <div v-else class="space-y-2 text-sm text-gray-500">
                  <p class="font-medium text-gray-700">No match yet</p>
                  <p>
                    Looks like this part of the day is still free. Pick another
                    date or refresh your interests.
                  </p>
                </div>
              </div>
            </div>

            <div
              v-if="loading"
              class="text-xs text-gray-500 text-center pt-2 border-t border-dashed border-gray-200"
            >
              Fetching events directly from Supabase…
            </div>

            <div
              v-else-if="error"
              class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {{ error }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
