<script setup>
  import { ref } from 'vue'
  import Trending from './Trending.vue'
  import ForYou from './ForYou.vue'
  import SpinTheWheel from './SpinTheWheel.vue'

  const activeTab = ref('trending')
</script>

<template>
  <main class="w-full px-6 py-10">
    <!-- Hero Section -->
    <div class="text-center">
      <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-800">
        Discover Amazing Events in Singapore
      </h1>
      <p class="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mb-8">
        Find personalized events, connect with friends, and never miss out on exciting activities
        around your campus.
      </p>

      <!-- Stats -->
      <div class="flex justify-center flex-wrap gap-8 mb-8 text-center">
        <div>
          <div class="text-3xl font-bold text-blue-600">500+</div>
          <div class="text-sm text-gray-500">Active Events</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-blue-600">10K+</div>
          <div class="text-sm text-gray-500">Students</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-blue-600">50+</div>
          <div class="text-sm text-gray-500">Universities</div>
        </div>
      </div>
    </div>

    <hr class="w-3/4 mx-auto border-gray-300 my-6" />

    <!-- Search and Location -->
    <div class="flex flex-col md:flex-row justify-center items-center gap-4 mb-6">
      <!-- Search Bar -->
      <form
        @submit.prevent="handleSearch"
        class="relative w-full max-w-md"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        >
          <path stroke-linecap="round" stroke-linejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="search"
          v-model="searchQuery"
          placeholder="Search events"
          class="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>

      <!-- Location Dropdown -->
      <div class="hidden md:flex items-center space-x-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-5 h-5 text-gray-600"
        >
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>

        <div class="relative">
          <button
            @click="showDropdown = !showDropdown"
            class="text-gray-800 font-medium flex items-center gap-1 border border-gray-200 rounded-md px-3 py-1 hover:bg-gray-100"
          >
            {{ currentLocation }}
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          <ul
            v-if="showDropdown"
            class="absolute z-10 mt-2 bg-white shadow-md rounded-md border border-gray-200 w-40 text-left"
          >
            <li class="px-3 py-1 text-xs text-gray-500 border-b">Select location</li>
            <li v-for="location in locations" :key="location">
              <button
                class="w-full text-left px-3 py-2 hover:bg-gray-100"
                :class="{'bg-blue-50 text-blue-600': currentLocation === location}"
                @click="selectLocation(location); showDropdown = false"
              >
                {{ location }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap justify-center gap-3 mb-8">
      <button class="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
        </svg>
        Filters
      </button>

      <button class="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75" />
        </svg>
        This Weekend
      </button>

      <button class="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
        Near Me
      </button>

      <span class="flex items-center gap-1 bg-gray-700 text-white px-3 py-2 rounded-md text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493" />
        </svg>
        23 friends online
      </span>
    </div>

    <!-- Tabs -->
    <div class="flex justify-center mb-6">
      <div class="flex space-x-4 border-b border-gray-200">
        <button
          @click="activeTab = 'trending'"
          :class="[
            'flex items-center gap-2 px-4 py-2 font-medium transition-colors',
            activeTab === 'trending'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-blue-500'
          ]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
          </svg>
          Trending
        </button>

        <button
          @click="activeTab = 'foryou'"
          :class="[
            'flex items-center gap-2 px-4 py-2 font-medium transition-colors',
            activeTab === 'foryou'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-blue-500'
          ]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442" />
          </svg>
          For You
        </button>
      </div>
    </div>

    <!-- Dynamic Content -->
    <Trending v-if="activeTab === 'trending'" />
    <ForYou v-if="activeTab === 'foryou'" />
  </main>
</template>

<script>
  export default {
    data() {
      return {
        locations: ['All', 'Central', 'North', 'Northeast', 'East', 'West'],
        currentLocation: 'All',
        showDropdown: false,
        searchQuery: ''
      }
    },
    methods: {
      selectLocation(location) {
        this.currentLocation = location
      }
    }
  }
</script>

<style scoped>
  .font-poppins {
    font-family: 'Poppins', sans-serif;
  }
</style>
