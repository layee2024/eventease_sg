<template>
  <nav class="w-full bg-white shadow-sm py-3 px-6 flex items-center justify-between font-poppins">
    <!-- Logo -->
    <router-link to="/" class="flex items-center space-x-2">
      <div class="flex items-center justify-center bg-black text-white rounded-md w-7 h-7 font-bold">
        <span>E</span>
      </div>
      <span class="font-bold text-base text-gray-800">EventEase SG</span>
    </router-link>

    <!-- Tabs -->
    <div class="flex items-center space-x-6">
      <ul class="flex space-x-4 text-gray-600 font-medium">
        <li>
          <router-link 
            to="/friends"
            class="flex items-center space-x-1 hover:text-blue-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            <span>Friends</span>
          </router-link>
        </li>

        <li>
          <router-link 
            to="/map"
            class="flex items-center space-x-1 hover:text-blue-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
            </svg>
            <span>Map</span>
          </router-link>
        </li>
      </ul>
    </div>

    <!-- Login / Register / Profile -->
    <div class="flex items-center space-x-3">
      <router-link 
        v-if="!isLoggedIn" 
        to="/login"
        class="btn btn-primary"
      >
        Login
      </router-link>

      <router-link 
        to="/register"
        class="btn btn-secondary"
      >
        Register
      </router-link>

      <!-- <router-link 
        to="/profile"
        class="btn border border-gray-400 text-gray-700 hover:bg-gray-100 font-medium px-4 py-1.5 rounded-md transition-colors"
      >
        Profile
      </router-link> -->
    </div>
  </nav>
</template>

<script>
  export default {
    props: ["isLoggedIn"]
  }
</script>

<style scoped>
  .font-poppins {
    font-family: 'Poppins', sans-serif;
  }
</style>
