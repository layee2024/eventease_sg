<script setup>
import { ref, defineEmits } from "vue"

const emits = defineEmits(["update-filter"])

// Filter states
const category = ref("")
const maxPrice = ref("")
const crowdLevel = ref("")

// Emit filter changes
function applyFilter() {
  emits("update-filter", {
    category,
    maxPrice: maxPrice ? parseFloat(maxPrice) : null,
    crowdLevel
  })
}

// Reset filters
function resetFilter() {
  category.value = ""
  maxPrice.value = ""
  crowdLevel.value = ""
  applyFilter()
}
</script>

<template>
  <div class="p-4 mb-6 bg-white rounded-lg shadow-sm flex flex-wrap gap-4">
    <select v-model="category" class="border rounded px-3 py-1">
      <option value="">All Categories</option>
      <option value="Music">Music</option>
      <option value="Food">Food</option>
      <option value="Arts">Arts</option>
      <option value="Tech">Tech</option>
      <option value="Sports">Sports</option>
    </select>

    <input
      type="number"
      v-model="maxPrice"
      placeholder="Max Price"
      class="border rounded px-3 py-1 w-24"
    />

    <select v-model="crowdLevel" class="border rounded px-3 py-1">
      <option value="">Any Crowd</option>
      <option value="High">High</option>
      <option value="Medium">Medium</option>
      <option value="Low">Low</option>
    </select>

    <button @click="applyFilter" class="px-4 py-1 bg-blue-600 text-white rounded">
      Apply
    </button>
    <button @click="resetFilter" class="px-4 py-1 bg-gray-300 rounded">
      Reset
    </button>
  </div>
</template>
