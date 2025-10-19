<script setup>
import { ref, onMounted } from "vue"
import { supabase } from "@/utils/supabase"
import { toast } from "vue-sonner"

const props = defineProps({
  eventId: { type: String, required: true },
})

const reviews = ref([])
const loading = ref(true)
const currentUserId = ref(null)

// Fetch current user
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  currentUserId.value = user?.id || null
}

// Fetch reviews (your reviews on top)
async function fetchReviews() {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, user_id, rating, comment, created_at, user_preferences(name, profile_picture)")
    .eq("event_id", props.eventId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  if (currentUserId.value) {
    const mine = data.filter((r) => r.user_id === currentUserId.value)
    const others = data.filter((r) => r.user_id !== currentUserId.value)
    reviews.value = [...mine, ...others]
  } else {
    reviews.value = data
  }

  loading.value = false
}

// Delete review (only your own)
async function deleteReview(reviewId) {
  const confirmDelete = confirm("Are you sure you want to delete this review?")
  if (!confirmDelete) return

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", currentUserId.value)

  if (error) {
    console.error(error)
    toast?.error("Failed to delete review")
  } else {
    toast?.success("Review deleted")
    reviews.value = reviews.value.filter((r) => r.id !== reviewId)
  }
}

onMounted(async () => {
  await getCurrentUser()
  await fetchReviews()
})

defineExpose({ fetchReviews })

</script>


<template>
    <div class=" pt-3">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Reviews</h2>
  
      <div v-if="loading" class="text-gray-400 text-sm">Loading reviews…</div>
  
      <div v-else-if="reviews.length === 0" class="text-gray-500 text-sm">
        No reviews yet — be the first to share your thoughts!
      </div>
  
      <div v-else class="space-y-4">
        <div
            v-for="(review, index) in reviews"
            :key="index"
            :class="[
            'bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm relative transition',
            review.user_id === currentUserId ? 'bg-blue-50 border-blue-100' : ''
            ]"
        >
            <div class="flex items-center gap-3 mb-2">
            <img
                :src="review.user_preferences?.profile_picture || '/default-avatar.png'"
                alt="user"
                class="w-8 h-8 rounded-full object-cover"
            />
            <div class="text-sm font-medium text-gray-800">
                {{ review.user_preferences?.name || 'Anonymous' }}
            </div>
            <div class="ml-auto text-yellow-400 text-xs">
                <span v-for="i in 5" :key="i">
                {{ i <= review.rating ? '★' : '☆' }}
                </span>
            </div>
            </div>

            <p class="text-gray-700 text-sm leading-snug">{{ review.comment }}</p>

            <div class="flex justify-between items-center mt-2">
            <p class="text-gray-400 text-[10px]">
                {{ new Date(review.created_at).toLocaleDateString('en-SG', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
                }) }}
            </p>

            <button
                v-if="review.user_id === currentUserId"
                @click="deleteReview(review.id)"
                class="text-red-500 hover:text-red-600 text-xs font-medium transition"
                >
                Delete
            </button>

            </div>
        </div>
        </div>

    </div>
</template>
  
