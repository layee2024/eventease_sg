<script setup>
import { ref, computed, onMounted } from "vue"
import { supabase } from "@/utils/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, RotateCw, Shuffle } from "lucide-vue-next"

const props = defineProps({
  events: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(["result"])

const isShuffling = ref(false)
const selectedEvent = ref(null)
const currentIndex = ref(0)
const shuffleCount = ref(0)
const totalEvents = ref(0)

onMounted(async () => {
  const { count, error } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })

  if (!error) totalEvents.value = count || 0
  else console.error("Failed to fetch total events count:", error)
})


// Get random events for display (showing 5 cards at a time)
const displayCards = computed(() => {
  if (!props.events || props.events.length === 0) return []

  // Show up to 5 cards in the deck
  const cards = []
  const totalCards = Math.min(5, props.events.length)

  for (let i = 0; i < totalCards; i++) {
    const index = (currentIndex.value + i) % props.events.length
    cards.push({
      event: props.events[index],
      zIndex: totalCards - i,
      offset: i
    })
  }

  return cards
})

// Card colors for variety
const cardColors = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-green-500 to-teal-500',
  'from-orange-500 to-red-500',
  'from-indigo-500 to-purple-500',
  'from-pink-500 to-rose-500',
  'from-yellow-500 to-orange-500',
  'from-emerald-500 to-green-500',
]

function getCardColor(index) {
  return cardColors[index % cardColors.length]
}

async function shuffleCards() {
  if (isShuffling.value || props.events.length === 0) return

  isShuffling.value = true
  shuffleCount.value = 0

  // Shuffle animation - cycle through cards quickly
  const shuffleDuration = 2000 // 2 seconds
  const shuffleSpeed = 100 // Change card every 100ms

  const shuffleInterval = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % props.events.length
    shuffleCount.value++
  }, shuffleSpeed)

  // Stop shuffling and select winner
  setTimeout(() => {
    clearInterval(shuffleInterval)

    // Pick a random final card
    const randomIndex = Math.floor(Math.random() * props.events.length)
    currentIndex.value = randomIndex
    selectedEvent.value = props.events[randomIndex]

    isShuffling.value = false
    emit("result", selectedEvent.value)
  }, shuffleDuration)
}

function reset() {
  if (isShuffling.value) return
  selectedEvent.value = null
  currentIndex.value = 0
  shuffleCount.value = 0
}

// Get category color
function getCategoryColor(category) {
  const colors = {
    Music: 'bg-purple-600',
    Food: 'bg-orange-500',
    Arts: 'bg-pink-500',
    Tech: 'bg-blue-600',
    Technology: 'bg-blue-600',
    Sports: 'bg-green-500',
    Education: 'bg-indigo-600',
    Business: 'bg-gray-600',
    Culture: 'bg-red-500',
    Health: 'bg-teal-500',
    Social: 'bg-yellow-500',
    Environment: 'bg-green-600'
  }
  return colors[category] || 'bg-gray-500'
}
</script>

<template>
  <div class="flex flex-col items-center gap-8">
    <!-- Card Stack Container -->
    <div class="relative w-full max-w-md">
      <!-- Card Deck -->
      <div class="relative h-[400px] flex items-center justify-center">
        <!-- Stack of cards -->
        <div
          v-for="(card, index) in displayCards"
          :key="index"
          :style="{
            zIndex: card.zIndex,
            transform: `
              translateY(${card.offset * -8}px)
              translateX(${card.offset * 2}px)
              rotate(${card.offset * 2 - 4}deg)
              scale(${1 - card.offset * 0.02})
            `,
            transition: isShuffling ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out'
          }"
          :class="[
            'absolute inset-0 mx-auto w-[320px]',
            isShuffling && index === 0 ? 'animate-pulse' : ''
          ]"
        >
          <Card class="h-full shadow-2xl border-4 border-white overflow-hidden">
            <!-- Card Background -->
            <div
              :class="[
                'absolute inset-0 bg-gradient-to-br opacity-10',
                getCardColor(currentIndex + index)
              ]"
            ></div>

            <!-- Card Content -->
            <div class="relative h-full flex flex-col">
              <!-- Event Image -->
              <div class="relative h-48 overflow-hidden">
                <img
                  :src="card.event.image_url"
                  :alt="card.event.title"
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                <!-- Category Badge -->
                <div
                  :class="[
                    'absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white',
                    getCategoryColor(card.event.category)
                  ]"
                >
                  {{ card.event.category }}
                </div>
              </div>

              <!-- Card Details -->
              <CardContent class="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <h3 class="text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {{ card.event.title }}
                  </h3>
                  <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                    {{ card.event.description || 'An exciting event you won\'t want to miss!' }}
                  </p>
                </div>

                <div class="space-y-2 text-sm">
                  <div class="flex items-center justify-between">
                    <span class="text-gray-500">📍 Location:</span>
                    <span class="font-medium text-gray-900 truncate ml-2">{{ card.event.venue }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-gray-500">💰 Price:</span>
                    <span
                      :class="[
                        'font-bold',
                        card.event.ticket_price === 0 ? 'text-green-600' : 'text-blue-600'
                      ]"
                    >
                      {{ card.event.ticket_price === 0 ? 'Free' : `$${card.event.ticket_price}` }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-gray-500">👥 Crowd:</span>
                    <span
                      :class="[
                        'px-2 py-1 rounded text-xs font-medium',
                        card.event.crowd_level === 'Low' ? 'bg-green-100 text-green-700' :
                        card.event.crowd_level === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      ]"
                    >
                      {{ card.event.crowd_level }}
                    </span>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>

        <!-- Shuffle effect overlay -->
        <div
          v-if="isShuffling"
          class="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div class="text-6xl animate-spin opacity-30">
            <Shuffle class="w-24 h-24 text-purple-600" />
          </div>
        </div>
      </div>

      <!-- Card counter -->
      <div class="text-center mt-4 text-gray-500 text-sm">
        <p v-if="!isShuffling">Shuffling {{ props.events.length }} of {{ totalEvents }} events</p>
        <p v-else class="animate-pulse font-bold text-purple-600">Shuffling... {{ shuffleCount }}</p>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex gap-4">
      <Button
        @click="shuffleCards"
        :disabled="isShuffling || props.events.length === 0"
        size="lg"
        class="gap-2 px-8 py-6 text-lg font-bold cursor-pointer"
        :class="isShuffling ? 'animate-pulse' : ''"
      >
        <Sparkles v-if="!isShuffling" class="w-6 h-6" />
        <Shuffle v-else class="w-6 h-6 animate-spin" />
        {{ isShuffling ? "Shuffling..." : "Shuffle Cards!" }}
      </Button>

      <Button
        v-if="selectedEvent && !isShuffling"
        @click="reset"
        size="lg"
        variant="outline"
        class="gap-2 px-6 cursor-pointer"
      >
        <RotateCw class="w-5 h-5" />
        Shuffle Again
      </Button>
    </div>

    <!-- Helper text -->
    <p v-if="props.events.length === 0" class="text-gray-500 text-center">
      No events available to shuffle. Try adjusting your preferences!
    </p>
  </div>
</template>

<style scoped>
/* Card stack shadow effect */
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Smooth animations */
@keyframes cardFlip {
  0%, 100% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(180deg);
  }
}

/* Line clamp utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
