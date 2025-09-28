<template>
  <div id="app">
    <Navbar v-if="showNavbar" :isLoggedIn="isLoggedIn" />
    <router-view class="min-vw-100 min-vh-100 poppins-regular"></router-view>
  </div>
</template>

<script>
  import { useRoute } from "vue-router";
  import { computed } from "vue";

  import Navbar from "./components/Navbar.vue";

  export default {
    components: { Navbar },
    setup() {
      const route = useRoute();

      // Hide navbar on login/register pages
      const hideOn = ["/login", "/register"];

      const showNavbar = computed(() => !hideOn.includes(route.path));

      // TODO: authenticate this
      const isLoggedIn = false;

      return { showNavbar, isLoggedIn };
    },
  };
</script>

<style scoped>
</style>