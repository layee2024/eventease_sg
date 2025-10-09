<script setup>
  import { RouterView } from 'vue-router';
  import { onMounted } from "vue";
  import { supabase } from './utils/supabase';
  import { Toaster } from '@/components/ui/sonner';
  import NavBar from './components/comp/NavBar.vue';
  import 'vue-sonner/style.css'


  async function getTodos() {
    const { data } = await supabase.from('events').select()

    console.log(data)
  }

  onMounted(() => {
    getTodos()
  })

</script>

<template>
  <div id="app" class="min-h-screen h-full">
    <NavBar />
    <Toaster />
    <div class="h-[90vh]">
      <RouterView />
    </div>
  </div>
</template>
