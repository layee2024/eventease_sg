<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { supabase } from "@/utils/supabase"
import { toast } from "vue-sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const router = useRouter()

// ---------- state ----------
const user = ref(null)
const name = ref("")
const email = ref("")
const userId = ref(null)

const profilePicture = ref("")
const interests = ref([])
const budget = ref("all")
const transportModes = ref([])

const avatarOpen = ref(false)
const interestsOpen = ref(false)
const budgetOpen = ref(false)
const transportOpen = ref(false)

// ---------- constants ----------
const AVATARS = [
  "https://avatar.iran.liara.run/public/1",
  "https://avatar.iran.liara.run/public/2",
  "https://avatar.iran.liara.run/public/3",
  "https://avatar.iran.liara.run/public/4",
  "https://avatar.iran.liara.run/public/5",
  "https://avatar.iran.liara.run/public/61",
  "https://avatar.iran.liara.run/public/62",
  "https://avatar.iran.liara.run/public/63",
  "https://avatar.iran.liara.run/public/64",
  "https://avatar.iran.liara.run/public/65",
]
const PLACEHOLDER =
  "https://cdn.vecteezy.com/system/resources/previews/004/511/281/original/default-avatar-photo-placeholder-profile-picture-symbol-vector.jpg"

const categories = [
  "Music","Food","Arts","Technology","Sports",
  "Education","Business","Culture","Health","Social","Environment",
]
const transportOptions = ["MRT", "Bus", "Car", "Bicycle", "Walk"]

const categoryColor = (cat) =>
  ({
    Music: "bg-purple-600",
    Food: "bg-orange-500",
    Arts: "bg-pink-500",
    Tech: "bg-blue-600",
    Technology: "bg-blue-600",
    Sports: "bg-green-500",
    Education: "bg-indigo-600",
    Business: "bg-gray-600",
    Culture: "bg-red-500",
    Health: "bg-teal-500",
    Social: "bg-yellow-500",
    Environment: "bg-green-600",
  }[cat] || "bg-gray-500")

onMounted(async () => {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) {
    toast.error("Please login first")
    router.push("/login")
    return
  }
  user.value = auth.user
  userId.value = auth.user.id
  name.value = auth.user.user_metadata?.full_name || "Anonymous User"
  email.value = auth.user.email

  const { data, error } = await supabase
    .from("user_preferences")
    .select("interests, budget, transport_mode, profile_picture")
    .eq("id", userId.value)
    .maybeSingle()

  if (error) {
    console.error(error)
    toast.error("Failed to load preferences")
  } else if (data) {
    interests.value = data.interests || []
    budget.value = data.budget || "all"
    transportModes.value = data.transport_mode || []
    profilePicture.value = data.profile_picture || PLACEHOLDER
  } else {
    await supabase.from("user_preferences").insert({
      id: userId.value,
      interests: [],
      budget: "all",
      transport_mode: [],
      saved: [],
      onboarding: true,
      profile_picture: PLACEHOLDER,
    })
    profilePicture.value = PLACEHOLDER
  }
})

// ---------- helpers ----------
async function updatePrefs(patch) {
  const { error } = await supabase
    .from("user_preferences")
    .update(patch)
    .eq("id", userId.value)
  if (error) throw error
}

async function saveInterests() {
  try {
    await updatePrefs({ interests: interests.value })
    toast.success("Interests updated")
    interestsOpen.value = false
  } catch (e) {
    toast.error("Failed to update interests")
  }
}

async function saveBudget() {
  try {
    await updatePrefs({ budget: budget.value })
    toast.success("Budget updated")
    budgetOpen.value = false
  } catch (e) {
    toast.error("Failed to update budget")
  }
}

async function saveTransport() {
  try {
    await updatePrefs({ transport_mode: transportModes.value })
    toast.success("Transport updated")
    transportOpen.value = false
  } catch (e) {
    toast.error("Failed to update transport")
  }
}

async function chooseAvatar(src) {
  try {
    profilePicture.value = src
    await updatePrefs({ profile_picture: src })
    toast.success("Profile picture updated")
    avatarOpen.value = false
  } catch (e) {
    toast.error("Failed to update profile picture")
  }
}

const initials = computed(() =>
  name.value
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
)
</script>

<template>
  <section class="py-10 md:py-16">
    <div class="container mx-auto max-w-6xl px-4">
      <div class="grid gap-7 md:grid-cols-3">
        <!-- profile -->
        <div class="flex justify-center items-center bg-blue-600 text-white rounded-xl p-8 relative">
          <div class="flex flex-col items-center text-center gap-5">
            <div class="size-36 rounded-full overflow-hidden bg-white/10 ring-4 ring-white/20 grid place-items-center">
              <img v-if="profilePicture" :src="profilePicture" alt="avatar" class="size-full object-cover" />
              <span v-else class="text-2xl font-bold">{{ initials }}</span>
            </div>
            <Button variant="secondary" @click="avatarOpen = true" class="cursor-pointer">
              Change Photo
            </Button>
            <div class="space-y-1">
              <h1 class="text-blue-100 text-xl font-semibold">{{ email }}</h1>
            </div>
          </div>
        </div>

        <!-- preferences cards -->
        <div class="md:col-span-2 grid gap-6 sm:grid-cols-2">
          <!-- Interests -->
          <Card class="hover:shadow-md transition">
            <CardContent class="p-6">
              <p class="text-sm text-gray-500 mb-2">Preferences</p>
              <h3 class="text-xl font-semibold mb-4">Interests</h3>
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  v-for="cat in (interests.length ? interests : ['None selected'])"
                  :key="cat"
                  class="px-2.5 py-1 rounded-full text-xs bg-gray-900 text-white"
                  :class="interests.length ? categoryColor(cat) : 'bg-gray-400'"
                >
                  {{ cat }}
                </span>
              </div>
              <Button variant="outline" size="sm" @click="interestsOpen = true" class="cursor-pointer">Manage</Button>
            </CardContent>
          </Card>

          <!-- Budget -->
          <Card class="hover:shadow-md transition">
            <CardContent class="p-6">
              <p class="text-sm text-gray-500 mb-2">Preferences</p>
              <h3 class="text-xl font-semibold mb-4">Budget</h3>
              <p class="text-gray-700 capitalize mb-4">
                {{ budget === 'all' ? 'All budgets' :
                   budget === 'low' ? 'Below $20' :
                   budget === 'mid' ? '$20–$50' : 'Above $50' }}
              </p>
              <Button variant="outline" size="sm" @click="budgetOpen = true" class="cursor-pointer">Manage</Button>
            </CardContent>
          </Card>

          <!-- Transport -->
          <Card class="hover:shadow-md transition">
            <CardContent class="p-6">
              <p class="text-sm text-gray-500 mb-2">Preferences</p>
              <h3 class="text-xl font-semibold mb-4">Transport</h3>
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  v-for="mode in (transportModes.length ? transportModes : ['None selected'])"
                  :key="mode"
                  class="px-2.5 py-1 rounded-full text-xs bg-gray-900 text-white"
                >
                  {{ mode }}
                </span>
              </div>
              <Button variant="outline" size="sm" @click="transportOpen = true" class="cursor-pointer">Manage</Button>
            </CardContent>
          </Card>

          <!-- Saved Events -->
          <Card class="hover:shadow-md transition">
            <CardContent class="p-6">
              <p class="text-sm text-gray-500 mb-2">Quick Access</p>
              <h3 class="text-xl font-semibold mb-2">Saved Events</h3>
              <p class="text-gray-700 mb-2">View and manage your saved events.</p>
              <Button variant="link" class="mt-2 px-0 cursor-pointer" @click="router.push('/saved')">Open →</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <!-- Avatar picker -->
    <Dialog v-model:open="avatarOpen">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select a profile picture</DialogTitle>
        </DialogHeader>
        <div class="grid grid-cols-5 gap-x-8 gap-y-2 place-items-center">
          <button
            v-for="src in AVATARS"
            :key="src"
            class="p-1 w-24 h-24 rounded-full overflow-hidden transition"
            :class="[
              profilePicture === src
                ? 'border-4 border-blue-500 cursor-default'
                : 'hover:border-2 hover:border-blue-400 cursor-pointer'
            ]"
            :disabled="profilePicture === src"
            @click="profilePicture !== src && chooseAvatar(src)"
          >
            <img :src="src" alt="avatar option" class="object-cover w-full h-full" />
          </button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Interests modal -->
    <Dialog v-model:open="interestsOpen">
      <DialogContent class="max-w-xl">
        <DialogHeader><DialogTitle>Edit interests</DialogTitle></DialogHeader>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="cat in categories"
            :key="cat"
            class="py-2 px-4 border rounded-lg text-sm font-medium transition"
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
        <DialogFooter>
          <Button variant="outline" @click="interestsOpen = false" class="cursor-pointer">Cancel</Button>
          <Button @click="saveInterests" class="cursor-pointer">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Budget modal -->
    <Dialog v-model:open="budgetOpen">
      <DialogContent class="max-w-md">
        <DialogHeader><DialogTitle>Edit budget</DialogTitle></DialogHeader>
        <div class="flex flex-col gap-2">
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
        <DialogFooter>
          <Button variant="outline" @click="budgetOpen = false" class="cursor-pointer">Cancel</Button>
          <Button @click="saveBudget" class="cursor-pointer">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Transport modal -->
    <Dialog v-model:open="transportOpen">
      <DialogContent class="max-w-md">
        <DialogHeader><DialogTitle>Edit transport</DialogTitle></DialogHeader>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="mode in transportOptions"
            :key="mode"
            class="py-2 px-4 border rounded-lg text-sm font-medium transition"
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
        <DialogFooter>
          <Button variant="outline" @click="transportOpen = false" class="cursor-pointer">Cancel</Button>
          <Button @click="saveTransport" class="cursor-pointer">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </section>
</template>

<style scoped>
.container {
  max-width: 1100px;
}
</style>
