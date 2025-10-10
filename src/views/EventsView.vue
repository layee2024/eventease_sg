<script setup>
  import { supabase } from '../utils/supabase';
  import { onMounted } from "vue";

  async function getTodos() {
    const { data } = await supabase.from('events').select()

    console.log(data)
  }

  onMounted(() => {
    getTodos()
  })
</script>

<script>

</script>

<template>
  <section>
    <div class="">
        <h2>Events</h2>
    </div>
  </section>
</template>
  
<style scoped>
</style>