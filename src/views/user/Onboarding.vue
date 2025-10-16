<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { supabase } from "@/utils/supabase"
import { Button } from "@/components/ui/button"
import { toast } from "vue-sonner"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

const router = useRouter()
const currentStep = ref(1)
const totalSteps = 4 // incremented by 1
const interests = ref([])
const budget = ref("all")
const transportModes = ref([])
const profilePicture = ref("https://www.vecteezy.com/vector-art/4511281-default-avatar-photo-placeholder-profile-picture")
const userId = ref(null)

const categories = [
  "Music", "Food", "Arts", "Technology", "Sports",
  "Education", "Business", "Culture", "Health", "Social", "Environment"
]
const transportOptions = ["MRT", "Bus", "Car", "Bicycle", "Walk"]

const avatarOptions = Array.from({ length: 10 }, (_, i) => {
  const ids = [1, 2, 3, 4, 5, 61, 62, 63, 64, 65]
  return `/avatars/${ids[i]}.png`
})

// Fetch current user ID
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) userId.value = user.id
})

// Navigation
function nextStep() { if (currentStep.value < totalSteps) currentStep.value++ }
function prevStep() { if (currentStep.value > 1) currentStep.value-- }

// Skip button
async function skipOnboarding() {
  await savePreferences({
    profile_picture: profilePicture.value,
    interests: interests.value || [],
    budget: budget.value || "all",
    transport_mode: transportModes.value || [],
    saved: [],
    onboarding: true,
  })
  toast("Default preferences saved")
  router.push("/")
}

// Save user preferences
async function finishOnboarding() {
  const data = {
    profile_picture: profilePicture.value,
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

  if (existing) await supabase.from("user_preferences").update(payload).eq("id", userId.value)
  else await supabase.from("user_preferences").insert(payload)
}
</script>

<template>
  <div class="flex flex-col justify-center items-center min-h-[93vh] bg-gray-50 px-6">
    <div class="max-w-lg w-full bg-white shadow-lg rounded-xl p-8 relative overflow-hidden">

      <div class="flex justify-center mb-6 space-x-2">
        <span v-for="n in totalSteps" :key="n"
              class="w-3 h-3 rounded-full transition-all"
              :class="n === currentStep ? 'bg-blue-600 w-5' : 'bg-gray-300'"></span>
      </div>

      <!-- Profile Picture -->
      <div v-if="currentStep === 1" class="text-center min-h-72">
        <h2 class="text-2xl font-semibold mb-4">Choose Your Avatar</h2>
        <p class="text-gray-500 mb-6">Select an image that best represents you.</p>

        <div class="grid grid-cols-5 gap-3 mb-6">
          <img
            v-for="url in avatarOptions"
            :key="url"
            :src="url"
            class="w-16 h-16 rounded-full object-cover border-2 cursor-pointer transition"
            :class="profilePicture === url ? 'border-blue-600 scale-110' : 'border-gray-200 hover:scale-105'"
            @click="profilePicture = url"
          />
        </div>
      </div>

      <!-- Interests -->
      <div v-if="currentStep === 2" class="text-center min-h-72">
        <h2 class="text-2xl font-semibold mb-4">Select Your Interests</h2>
        <p class="text-gray-500 mb-6">Choose the types of events you're most interested in.</p>
        <div class="flex flex-wrap gap-3 mb-6 justify-center">
          <button
            v-for="cat in categories"
            :key="cat"
            class="basis-1/3 lg:basis-1/4 max-w-full sm:max-w-[33%] lg:max-w-[25%] min-w-30
                  py-2 px-4 border rounded-lg text-sm font-medium transition-all cursor-pointer text-center"
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
      <div v-if="currentStep === 3" class="text-center min-h-72">
        <h2 class="text-2xl font-semibold mb-4">Set Your Budget</h2>
        <p class="text-gray-500 mb-6">What's your preferred spending range for events?</p>
        <div class="flex justify-center mb-6">
          <Select v-model="budget">
            <SelectTrigger class="w-64">
              <SelectValue placeholder="Select a budget range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All budgets</SelectItem>
              <SelectItem value="low">Below $20</SelectItem>
              <SelectItem value="mid">$20 - $50</SelectItem>
              <SelectItem value="high">Above $50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>


      <!-- Transport Mode -->
      <div v-if="currentStep === 4" class="text-center min-h-72">
        <h2 class="text-2xl font-semibold mb-4">Preferred Transport</h2>
        <p class="text-gray-500 mb-6">How do you usually get around to attend events?</p>

        <div class="flex flex-wrap gap-3 mb-6 justify-center">
          <button
            v-for="mode in transportOptions"
            :key="mode"
            class="basis-1/3 lg:basis-1/4 max-w-full sm:max-w-[33%] lg:max-w-[25%] min-w-30
                  py-2 px-4 border rounded-lg text-sm font-medium transition-all cursor-pointer text-center"
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
        <Button class="cursor-pointer" variant="outline" @click="skipOnboarding">Skip for now</Button>
        <div class="flex gap-2">
          <Button class="cursor-pointer" v-if="currentStep > 1" variant="outline" @click="prevStep">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
            </svg>
          </Button>
          <Button class="cursor-pointer" v-if="currentStep < totalSteps" @click="nextStep">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
            </svg>
          </Button>
          <Button class="cursor-pointer" v-if="currentStep === totalSteps" @click="finishOnboarding">Finish</Button>
        </div>
      </div>
    </div>
  </div>
</template>
