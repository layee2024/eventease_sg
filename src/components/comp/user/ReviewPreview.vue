<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { supabase } from "@/utils/supabase"

const props = defineProps({
  eventId: { type: String, required: true },
})

const averageRating = ref(0)
const router = useRouter()

async function fetchAverageRating() {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("event_id", props.eventId)

  if (!error && data && data.length > 0) {
    const total = data.reduce((sum, r) => sum + r.rating, 0)
    averageRating.value = total / data.length
  } else {
    averageRating.value = 0
  }
}

onMounted(fetchAverageRating)
</script>

<template>
  <div class="flex flex-col items-start text-[11px] text-gray-600 dark:text-gray-800 w-full leading-tight">
    <!-- Star rating -->
    <div class="flex items-center gap-1">
      <div class="flex">
        <span
          v-for="i in 5"
          :key="i"
          class="text-yellow-400"
        >
          {{ i <= Math.round(averageRating) ? '★' : '☆' }}
        </span>
      </div>
      <span class="ml-1 text-gray-500 dark:text-gray-800 ">
        {{ averageRating > 0 ? averageRating.toFixed(1) : 'No rating yet' }}
      </span>
    </div>
  </div>
</template>
