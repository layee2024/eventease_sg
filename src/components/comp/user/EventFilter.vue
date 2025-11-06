<script setup>
import { ref, defineEmits, defineProps, watch, onMounted } from "vue"
import { Search } from "lucide-vue-next"
import { supabase } from "@/utils/supabase"

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
const eventCat = ref([])
const crowdLvl = ref([])

const sortBy =ref({
  'Nearest': 'distance',
  'Upcoming': 'date',
  'Title (A-Z)': 'title',
  'Price (Low → High)': 'priceLow',
  'Price (High → Low)': 'priceHigh',
})


async function populateFilterFunction(){
  const { data, error } = await supabase.from('events').select("*");

  if (error){
  }
  else{
    const categories = [...new Set(data.map(event => event.category))]
    eventCat.value = categories

    const crowdlevel = [...new Set(data.map(event => event.crowd_level))]
    crowdLvl.value = crowdlevel
  }
}


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
onMounted(() => {
  populateFilterFunction()
})
</script>


<template>
  <div class="bg-white dark:bg-black shadow-sm dark:shadow-sky-400 rounded-xl p-5 space-y-4 w-full max-w-4xl mx-auto">
    
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
      <Search class="w-5 h-5 text-gray-400 border-gray-200 dark:text-gray-200 dark:border-gray-800 mr-2" />
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search events by title or venue..."
        class="w-full outline-none border-gray-200 dark:text-gray-200 dark:border-gray-800 text-sm sm:text-base"
      />
    </div>
  </div>

  <!-- Budget -->
  <input
    type="number"
    v-model="maxPrice"
    placeholder="Budget"
    class="border border-gray-200 dark:text-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 w-full text-sm sm:text-base"
  />

  <!-- Category -->
  <select
    v-model="category"
    class="border border-gray-200 dark:text-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 w-full text-sm sm:text-base cursor-pointer"
  >
    <option value="">All Categories</option>
    <option 
    v-for="cat in eventCat" 
    :key="cat"
    :value="cat"
    > {{ cat }} </option>
  </select>

  <!-- Crowd Level -->
  <select
    v-model="crowdLevel"
    class="border border-gray-200 dark:text-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 w-full text-sm sm:text-base cursor-pointer"
  >
    <option value="">Any Crowd</option>
    <option 
    v-for="lvl in crowdLvl"
    :key="lvl"
    :value="lvl"
    > {{ lvl }} </option>
  </select>

  <!-- Sort By -->
  <select
    v-model="sortOption"
    class="border border-gray-200 dark:text-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 w-full text-sm sm:text-base cursor-pointer"
  >
    <option value="">Sort By</option>
    <option v-for="(value, label) in sortBy"
    :key="label"
    :value="value"> {{ label }}</option>
  </select>
  <!-- Buttons -->
  <div class="flex justify-center w-full gap-3 col-span-2 md:col-span-4 lg:col-span-2">
    <button
      @click="applyFilter"
      class="bg-sky-400 hover:bg-sky-600 text-white px-5 py-2 rounded-lg font-medium transition w-full cursor-pointer"
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
