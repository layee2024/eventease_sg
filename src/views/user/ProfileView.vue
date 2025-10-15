<script setup>
import { ref, onMounted } from "vue"
import { supabase } from "@/utils/supabase"
import { Button } from "@/components/ui/button"
import { toast } from "vue-sonner"

const userName = ref("")
const userId = ref(null)
const interests = ref([])
const budget = ref("all")
const transportModes = ref([])

const categories = [
  "Music", "Food", "Arts", "Technology", "Sports",
  "Education", "Business", "Culture", "Health", "Social", "Environment"
]
const transportOptions = ["MRT", "Bus", "Car", "Bicycle", "Walk"]

// Fetch user details and preferences
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    toast.error("Please login first.")
    return
  }

  userName.value = user.user_metadata?.full_name || user.email
  userId.value = user.id

  const { data, error } = await supabase
    .from("user_preferences")
    .select("interests, budget, transport_mode")
    .eq("id", user.id)
    .maybeSingle()

  if (error) {
    console.error("Error loading preferences:", error)
    toast.error("Failed to load preferences.")
  } else if (data) {
    interests.value = data.interests || []
    budget.value = data.budget || "all"
    transportModes.value = data.transport_mode || []
  }
})

// Save preferences
async function savePreferences() {
  if (!userId.value) return toast.error("No user session found.")

  const payload = {
    interests: interests.value,
    budget: budget.value,
    transport_mode: transportModes.value,
  }

  const { error } = await supabase
    .from("user_preferences")
    .update(payload)
    .eq("id", userId.value)

  if (error) {
    console.error(error)
    toast.error("Failed to update preferences.")
  } else {
    toast.success("Preferences updated successfully!")
  }
}
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-50 px-6 py-10">
    <div class="max-w-3xl w-full bg-white shadow-lg rounded-xl p-8">
      <h1 class="text-2xl font-semibold text-center mb-6">Profile</h1>

      <!-- User Info -->
      <div class="text-center mb-6">
        <p class="text-gray-500 text-sm mb-1">Logged in as</p>
        <h2 class="text-lg font-medium text-gray-800">{{ userName }}</h2>
      </div>

      <!-- Preferences Section -->
      <div>
        <!-- Interests -->
        <h3 class="text-lg font-semibold mt-4 mb-2">Your Interests</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          <button
            v-for="cat in categories"
            :key="cat"
            class="py-2 px-4 border rounded-lg text-sm font-medium transition-all"
            :class="interests.includes(cat)
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'"
            @click="interests.includes(cat)
              ? interests.splice(interests.indexOf(cat), 1)
              : interests.push(cat)"
          >
            {{ cat }}
          </button>
        </div>

        <!-- Budget -->
        <h3 class="text-lg font-semibold mb-2">Budget Range</h3>
        <div class="flex flex-col gap-2 mb-6">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" value="all" v-model="budget" /> All budgets
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" value="low" v-model="budget" /> Below $20
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" value="mid" v-model="budget" /> $20–$50
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" value="high" v-model="budget" /> Above $50
          </label>
        </div>

        <!-- Transport -->
        <h3 class="text-lg font-semibold mb-2">Preferred Transport</h3>
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          <button
            v-for="mode in transportOptions"
            :key="mode"
            class="py-2 px-4 border rounded-lg text-sm font-medium transition-all"
            :class="transportModes.includes(mode)
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'"
            @click="transportModes.includes(mode)
              ? transportModes.splice(transportModes.indexOf(mode), 1)
              : transportModes.push(mode)"
          >
            {{ mode }}
          </button>
        </div>

        <!-- Save Button -->
        <div class="flex justify-center">
          <Button @click="savePreferences" class="cursor-pointer">Save Changes</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
