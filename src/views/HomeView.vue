<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import Typewriter from "../components/comp/Typewriter.vue"
import MultiSelect from "../components/comp/MultiSelect.vue"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const router = useRouter()
const searchQuery = ref("")
const activePopover = ref(null)

const withAll = (items) => [{ label: "All", value: "all" }, ...items]

const categoryOptions = withAll([
  { label: "Music", value: "music" },
  { label: "Sports", value: "sports" },
  { label: "Food & Drink", value: "food" },
  { label: "Art & Culture", value: "art" },
])

const budgetOptions = withAll([
  { label: "Free", value: 0 },
  { label: "Under $10", value: 10 },
  { label: "$10–$20", value: 20 },
  { label: "$20–$30", value: 30 },
  { label: "Over $30", value: "ex" },
])

const locationOptions = withAll([
  { label: "Central", value: "central" },
  { label: "East", value: "east" },
  { label: "North", value: "north" },
  { label: "West", value: "west" },
])

const crowdOptions = withAll([
  { label: "Quiet", value: "quiet" },
  { label: "Moderate", value: "moderate" },
  { label: "Busy", value: "busy" },
])

const selectedCategories = ref([])
const selectedBudgets = ref([])
const selectedLocations = ref([])
const selectedCrowds = ref([])

function handleSearch() {
  
}
</script>

<template>
  <main class="relative w-full">
    <!-- HERO -->
    <section class="relative w-full h-[75vh] overflow-hidden">
      <img src="../assets/cover.png" alt="Singapore Events Crowd" class="absolute inset-0 w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

      <div class="relative z-10 flex flex-col justify-center h-full max-w-3xl px-6 md:px-16">
        <h1 class="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
          Discover Amazing <br />
          <Typewriter text="Events in Singapore" classes="text-yellow-400" cursorColor="bg-yellow-400" />
        </h1>
        <p class="mt-6 text-lg text-gray-100 leading-relaxed max-w-2xl">
          Find events that match your mood, budget, and interests — all in one place. Connect with friends and never miss out on the best experiences.
        </p>
        <RouterLink to="/events"><Button variant="secondary" class="mt-4">Start Exploring</Button></RouterLink>
      </div>
    </section>

    <div class="relative z-20 -mt-10 mx-auto w-[85%] 2xl:w-[75%] bg-white shadow-lg rounded-2xl p-4 md:p-6 backdrop-blur-md">
      <div class="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7 items-center">
        <!-- Search -->
        <div class="flex items-center w-full sm:col-span-2 md:col-span-4 xl:col-span-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-gray-500 mr-2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Input v-model="searchQuery" type="text" placeholder="Search events" class="flex-1 border-0 focus-visible:ring-0 bg-transparent placeholder-gray-500" />
        </div>

        <!-- Category -->
        <MultiSelect
          label="Category"
          :options="categoryOptions"
          v-model="selectedCategories"
          :open="activePopover === 'category'"
          @update:open="v => (activePopover = v ? 'category' : null)"
        />

        <!-- Budget -->
        <MultiSelect
          label="Budget"
          :options="budgetOptions"
          v-model="selectedBudgets"
          :open="activePopover === 'budget'"
          @update:open="v => (activePopover = v ? 'budget' : null)"
        />

        <!-- Location -->
        <MultiSelect
          label="Location"
          :options="locationOptions"
          v-model="selectedLocations"
          :open="activePopover === 'location'"
          @update:open="v => (activePopover = v ? 'location' : null)"
        />

        <!-- Crowd -->
        <MultiSelect
          label="Crowd Level"
          :options="crowdOptions"
          v-model="selectedCrowds"
          :open="activePopover === 'crowd'"
          @update:open="v => (activePopover = v ? 'crowd' : null)"
        />

        <!-- Search btn -->
        <Button @click="handleSearch" class="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-xl md:w-auto sm:col-span-2 md:col-span-full xl:col-span-1">
          Search
        </Button>
      </div>
    </div>
  </main>
</template>

<style scoped>
@media (min-width: 768px) { .-mt-10 { margin-top: -2.5rem; } }
</style>
