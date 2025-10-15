<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { supabase } from "@/utils/supabase"
import { Button } from "@/components/ui/button"
import { toast } from "vue-sonner"

const router = useRouter()
const currentStep = ref(1)
const totalSteps = 3
const interests = ref([])
const budget = ref("all")
const transportModes = ref([])
const userId = ref(null)

const categories = [
  "Music", "Food", "Arts", "Technology", "Sports",
  "Education", "Business", "Culture", "Health", "Social", "Environment"
]

const transportOptions = ["MRT", "Bus", "Car", "Bicycle", "Walk"]

// Fetch current user ID
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) userId.value = user.id
})

// Navigation
function nextStep() {
  if (currentStep.value < totalSteps) currentStep.value++
}
function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

// Skip button
async function skipOnboarding() {
  await savePreferences({
    interests: [],
    budget: "all",
    transport_mode: [],
    saved: [],
    onboarding: true,
  })
  toast("Default preferences saved")
  router.push("/") // redirect to home
}

// Save user preferences
async function finishOnboarding() {
  const data = {
    interests: interests.value,
    budget: budget.value || "all",
    transport_mode: transportModes.value,
    onboarding: true,
  }
  await savePreferences(data)
  toast.success("Your preferences have been saved.")
  router.push("/")
}

// Save or update
async function savePreferences(data) {
  if (!userId.value) return toast.error("No user session found.")
  const { data: existing } = await supabase
    .from("user_preferences")
    .select("id")
    .eq("id", userId.value)
    .maybeSingle()

  const payload = { id: userId.value, ...data }

  if (existing) {
    await supabase.from("user_preferences").update(payload).eq("id", userId.value)
  } else {
    await supabase.from("user_preferences").insert(payload)
  }
}
</script>

<template>
  <div class="flex flex-col justify-center items-center min-h-screen bg-gray-50 px-6">
    <div class="max-w-md w-full bg-white shadow-lg rounded-xl p-8 relative overflow-hidden">

      <div class="flex justify-center mb-6 space-x-2">
        <span v-for="n in totalSteps" :key="n"
              class="w-3 h-3 rounded-full transition-all"
              :class="n === currentStep ? 'bg-blue-600 w-5' : 'bg-gray-300'"></span>
      </div>

      <!-- Interests -->
      <div v-if="currentStep === 1" class="text-center">
        <h2 class="text-2xl font-semibold mb-4">Select Your Interests</h2>
        <p class="text-gray-500 mb-6">Choose the types of events you're most interested in.</p>

        <div class="grid grid-cols-2 gap-3 mb-6">
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
      </div>

      <!-- Budget -->
      <div v-if="currentStep === 2" class="text-center">
        <h2 class="text-2xl font-semibold mb-4">Set Your Budget</h2>
        <p class="text-gray-500 mb-6">What's your preferred spending range for events?</p>

        <div class="flex flex-col gap-3 mb-6">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" value="all" v-model="budget" /> All budgets
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" value="low" v-model="budget" /> Below $20
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" value="mid" v-model="budget" /> $20-$50
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" value="high" v-model="budget" /> Above $50
          </label>
        </div>
      </div>

      <!-- Transport Mode -->
      <div v-if="currentStep === 3" class="text-center">
        <h2 class="text-2xl font-semibold mb-4">Preferred Transport</h2>
        <p class="text-gray-500 mb-6">How do you usually get around to attend events?</p>

        <div class="grid grid-cols-2 gap-3 mb-6">
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
      </div>

      <!-- Navigation -->
      <div class="flex justify-between mt-4">
        <Button variant="outline" @click="skipOnboarding">Skip for now</Button>

        <div class="flex gap-2">
          <Button v-if="currentStep > 1" variant="outline" @click="prevStep">Back</Button>
          <Button v-if="currentStep < totalSteps" @click="nextStep">Next</Button>
          <Button v-if="currentStep === totalSteps" @click="finishOnboarding">Finish</Button>
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
