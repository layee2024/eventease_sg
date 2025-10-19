<script setup>
import { ref } from "vue"
import { supabase } from "@/utils/supabase"
import { toast } from "vue-sonner"

const props = defineProps({
  eventId: { type: String, required: true },
})

const rating = ref(5)
const comment = ref("")
const submitting = ref(false)
const emit = defineEmits(['review-added'])

async function submitReview() {
  submitting.value = true
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    toast.error("Please log in to post a review.")
    submitting.value = false
    return
  }

  const { error } = await supabase
    .from("reviews")
    .insert({
      event_id: props.eventId,
      user_id: user.id,
      rating: rating.value,
      comment: comment.value,
    })

  if (error) {
    toast.error("Failed to post review.")
  } else {
    toast.success("Review submitted!")
    // 🔁 trigger parent to refresh the list NOW
    emit('review-added')
    rating.value = 5
    comment.value = ""
  }

  submitting.value = false
}
</script>

<template>
  <div class="mt-6 border-t border-gray-100 pt-5">
    <h3 class="text-lg font-semibold mb-2">Leave a Review</h3>

    <div class="flex items-center gap-2 mb-3">
      <label class="text-sm text-gray-600">Rating:</label>
      <select
        v-model.number="rating"
        class="border rounded-md px-2 py-1 text-sm focus:outline-none"
      >
        <option v-for="n in 5" :key="n" :value="n">{{ n }} ★</option>
      </select>
    </div>

    <textarea
      v-model="comment"
      placeholder="Share your experience..."
      class="w-full border rounded-md p-2 text-sm h-24 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
    ></textarea>

    <button
      @click="submitReview"
      :disabled="submitting"
      class="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition cursor-pointer disabled:opacity-60"
    >
      {{ submitting ? "Submitting..." : "Submit Review" }}
    </button>
  </div>
</template>
