<script setup>
import { Card, CardContent } from "@/components/ui/card";
import { ref, computed } from "vue";

const props = defineProps({
  title: String,
  category: String,
  categoryColor: String,
  location: String,
  price: String,
  date: String,
  crowd: String,
  image: String,
  liked: { type: Boolean, default: false },
});

const isLiked = ref(props.liked);
function toggleLike() {
  isLiked.value = !isLiked.value;
}

// Determine crowd color
const crowdColor = computed(() => {
  const level = (props.crowd || "").toLowerCase();
  if (level.includes("low") || level.includes("quiet")) return "bg-green-500";
  if (level.includes("moderate") || level.includes("medium")) return "bg-orange-400";
  if (level.includes("high") || level.includes("busy")) return "bg-red-500";
  return "bg-gray-400";
});
</script>

<template>
  <Card
    class="overflow-hidden rounded-2xl shadow-sm border border-gray-100 transition hover:shadow-md"
  >
    <div class="relative">
      <img :src="image" :alt="title" class="w-full h-44 object-cover" />

      <!-- Category tag -->
      <span
        class="absolute top-3 left-3 text-xs font-medium text-white px-3 py-1 rounded-full"
        :class="categoryColor"
      >
        {{ category }}
      </span>

      <!-- Crowd level -->
      <span
        class="absolute bottom-3 right-3 text-xs font-medium text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1"
      >
        <span :class="['w-2 h-2 rounded-full', crowdColor]" />
        {{ crowd }}
      </span>

      <!-- Like button -->
      <button
        @click="toggleLike"
        class="absolute top-3 right-3 bg-white/80 hover:bg-white text-gray-700 rounded-full p-1.5 backdrop-blur-sm transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          :fill="isLiked ? 'red' : 'none'"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-4 transition"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
          />
        </svg>
      </button>
    </div>

    <CardContent class="p-4">
      <h3 class="font-semibold text-gray-900 text-base truncate">{{ title }}</h3>
      <p class="text-sm text-gray-500">{{ location }}</p>

      <div class="flex justify-between items-center mt-3">
        <span
          class="text-sm font-medium"
          :class="{
            'text-green-600': price.toLowerCase() === 'free',
            'text-blue-600': price.toLowerCase() !== 'free',
          }"
        >
          {{ price }}
        </span>
        <span class="text-sm text-gray-400">{{ date }}</span>
      </div>
    </CardContent>
  </Card>
</template>
