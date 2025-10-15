<script setup>
import { ref, onMounted } from "vue"
import { supabase } from "../../utils/supabase"
import { toast } from "vue-sonner"

const loading = ref(true)

onMounted(async () => {
  // loading.value = true

  // // Get current organiser
  // const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  // if (sessionError || !session?.user) {
  //   toast.error("No active session found.")
  //   loading.value = false
  //   return
  // }

  // const organiserId = session.user.id

  // // Verify organiser
  // const { error } = await supabase
  //   .from("organiser_details")
  //   .update({ verified: true })
  //   .eq("id", organiserId)

  // if (error) {
  //   toast.error("Failed to verify organiser.")
  //   console.error(error)
  // } else {
  //   toast.success("You have been verified!")
  // }

  // loading.value = false
})
</script>

<template>
  <div class="px-6 py-10 max-w-5xl mx-auto">
    <h2 class="text-2xl font-semibold">Dashboard</h2>
  </div>
</template>
