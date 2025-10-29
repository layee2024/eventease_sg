<script setup>
import { ref, defineEmits, defineProps, watch } from "vue"
import { Search } from "lucide-vue-next"

const emits = defineEmits(["update-filter"])
const props = defineProps({
  initialSearch: {
    type: String,
    default: ""
  }
})

const category = ref("")
const maxPrice = ref("")
const crowdLevel = ref("")
const searchQuery = ref(props.initialSearch)
const sortOption = ref("")

function applyFilter() {
  emits("update-filter", {
    category: category.value,
    maxPrice: maxPrice.value ? parseFloat(maxPrice.value) : null,
    crowdLevel: crowdLevel.value,
    searchQuery: searchQuery.value,
    sortOption: sortOption.value,
  })
}

function resetFilter() {
  category.value = ""
  maxPrice.value = ""
  crowdLevel.value = ""
  searchQuery.value = ""
  sortOption.value = ""
  applyFilter()
}

// Automatically apply filter as user types
watch(searchQuery, () => {
  applyFilter()
})
</script>


<template>
  <div class="bg-white dark:bg-[#f5f5f5] shadow-sm rounded-xl p-5 space-y-4 w-full max-w-4xl mx-auto">
    
    <div
  class="grid gap-3 items-center 
         grid-cols-2 
         md:grid-cols-[25%_25%_20%_auto] 
         lg:grid-cols-[18%_18%_18%_18%_auto_auto]
         w-full"
>
  <!-- Search Bar -->
  <div class="flex flex-col md:flex-row gap-3 col-span-full lg:col-span-6">
    <div
      class="flex items-center border rounded-lg px-3 py-2 
             focus-within:ring-2 focus-within:ring-blue-500 
             transition w-full"
    >
      <Search class="w-5 h-5 text-gray-400 border-gray-500 mr-2" />
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search events by title or venue..."
        class="w-full outline-none text-gray-700 border-gray-500 text-sm sm:text-base"
      />
    </div>
  </div>

  <!-- Budget -->
  <input
    type="number"
    v-model="maxPrice"
    placeholder="Budget"
    class="border border-gray-500 rounded-lg px-3 py-2 w-full text-sm sm:text-base"
  />

  <!-- Category -->
  <select
    v-model="category"
    class="border border-gray-500 rounded-lg px-3 py-2 w-full text-sm sm:text-base cursor-pointer"
  >
    <option value="">All Categories</option>
    <option value="Music">Music</option>
    <option value="Food">Food</option>
    <option value="Arts">Arts</option>
    <option value="Technology">Technology</option>
    <option value="Sports">Sports</option>
    <option value="Education">Education</option>
    <option value="Business">Business</option>
    <option value="Culture">Culture</option>
    <option value="Health">Health</option>
    <option value="Social">Social</option>
    <option value="Environment">Environment</option>
  </select>

  <!-- Crowd Level -->
  <select
    v-model="crowdLevel"
    class="border border-gray-500 rounded-lg px-3 py-2 w-full text-sm sm:text-base cursor-pointer"
  >
    <option value="">Any Crowd</option>
    <option value="High">High</option>
    <option value="Moderate">Moderate</option>
    <option value="Low">Low</option>
  </select>

  <!-- Sort By -->
  <select
    v-model="sortOption"
    class="border border-gray-500 rounded-lg px-3 py-2 w-full text-sm sm:text-base cursor-pointer"
  >
    <option value="">Sort By</option>
    <option value="distance">Nearest</option>
    <option value="date">Upcoming (Soonest)</option>
    <option value="title">Title (A-Z)</option>
    <option value="priceLow">Price (Low → High)</option>
    <option value="priceHigh">Price (High → Low)</option>
  </select>
  <!-- Buttons -->
  <div class="flex justify-center w-full gap-3 col-span-2 md:col-span-4 lg:col-span-2">
    <button
      @click="applyFilter"
      class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition w-full cursor-pointer"
    >
      Search
    </button>
  
    <button
      @click="resetFilter"
      class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-medium transition w-full cursor-pointer"
    >
      Reset
    </button>
  </div>
</div>



  </div>
</template>
