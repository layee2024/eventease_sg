<template>
  <div id="app" class="w-full min-h-screen">
    <Navbar />
    <router-view class="w-full poppins-regular"></router-view>
  </div>
</template>

<script setup>
  import { onMounted } from "vue";
  import { supabase } from "./utils/supabase";

  async function getTodos() {
    const { data } = await supabase.from('events').select()
    console.log(data)
  }

  onMounted(() => {
    getTodos()
  })
</script>

<script>
  import { useRoute } from "vue-router";
  import { computed } from "vue";

  import Navbar from "./components/Navbar.vue";

  export default {
    components: { Navbar },
    setup() {
      const route = useRoute();

      return { showNavbar, isLoggedIn };
    },
  };
</script>

<style scoped>
</style>