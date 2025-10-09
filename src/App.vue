<script setup>
  import { RouterView } from 'vue-router';
  import { onMounted } from "vue";
  import { supabase } from './utils/supabase';
  import { Toaster } from '@/components/ui/sonner';
  import 'vue-sonner/style.css' // vue-sonner v2 requires this import


  async function getTodos() {
    const { data } = await supabase.from('events').select()

    console.log(data)
  }

  onMounted(() => {
    getTodos()
  })

</script>

<template>
  <div id="app">
    <Toaster />
    <RouterView />
  </div>
</template>
