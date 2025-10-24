<script setup>
import { ref, onMounted, computed, watch } from "vue"
import { useRouter } from "vue-router"
import { supabase } from "@/utils/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Heart } from "lucide-vue-next"
import { toast } from "vue-sonner"
import ReviewPreview from "@/components/comp/user/ReviewPreview.vue"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "@/components/ui/tooltip"

const props = defineProps({
  id: { type: String, required: true },
  title: String,
  category: String,
  categoryColor: String,
  location: String,
  price: String,
  date: String,
  crowd: String,
  image: String,
  liked: { type: Boolean, default: false },
  distance: Number,
})

const emit = defineEmits(["update-saved"])
const router = useRouter()
const isJoined = ref(false)
const isLiked = ref(props.liked)
const goingCount = ref(0)
const friendsGoing = ref([]) // holds array of friend objects
const loadingGoing = ref(true)

async function fetchGoingStats(eventId) {
  if (!eventId) return
  loadingGoing.value = true

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      goingCount.value = 0
      friendsGoing.value = []
      loadingGoing.value = false
      return
    }

    // check if user joined
    const { data: pref, error: prefErr } = await supabase
      .from("user_preferences")
      .select("going")
      .eq("id", user.id)
      .single()
    if (prefErr) throw prefErr
    isJoined.value = pref?.going?.includes(eventId)

    // total going
    const { count, error: countErr } = await supabase
      .from("user_preferences")
      .select("id", { count: "exact", head: true })
      .contains("going", [eventId])
    if (countErr) throw countErr
    goingCount.value = count ?? 0

    // get friends list
    const { data: me, error: meErr } = await supabase
      .from("user_preferences")
      .select("friends")
      .eq("id", user.id)
      .single()
    if (meErr) throw meErr

    const friends = me?.friends || []
    if (!friends.length) {
      friendsGoing.value = []
      loadingGoing.value = false
      return
    }

    // get which friends are going
    const { data: goingFriends, error: fErr } = await supabase
      .from("user_preferences")
      .select("id, name, profile_picture, going")
      .in("id", friends)
    if (fErr) throw fErr

    const filtered = (goingFriends || []).filter(f => (f.going || []).includes(eventId))
    friendsGoing.value = filtered
  } catch (err) {
    console.error("Error fetching going stats:", err)
    toast.error("Failed to load going stats")
    goingCount.value = 0
    friendsGoing.value = []
  } finally {
    loadingGoing.value = false
  }
}

onMounted(() => {
  fetchGoingStats(props.id)
})

watch(() => props.id, (newId) => {
  if (newId) fetchGoingStats(newId)
})

watch(
  () => props.liked,
  (val) => (isLiked.value = val)
)

function goToDetails() {
  if (!props.id) return
  router.push(`/event/${props.id}`)
}

// Toggle like
async function toggleLike() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    toast.error("Please login to save events")
    return
  }

  isLiked.value = !isLiked.value
  emit("update-saved", { id: props.id, liked: isLiked.value })

  const { data: pref, error: prefErr } = await supabase
    .from("user_preferences")
    .select("saved")
    .eq("id", user.id)
    .single()

  if (prefErr) {
    console.error(prefErr)
    toast.error("Could not update saved list")
    return
  }

  let updated = pref?.saved || []
  if (isLiked.value) {
    if (!updated.includes(props.id)) updated.push(props.id)
    toast.success(`${props.title} added to saved events`)
  } else {
    updated = updated.filter((x) => x !== props.id)
    toast.info(`${props.title} removed from saved events`)
  }

  const { error: updErr } = await supabase
    .from("user_preferences")
    .update({ saved: updated })
    .eq("id", user.id)

  if (updErr) {
    console.error(updErr)
    toast.error("Failed to update saved events")
  }
}

const crowdColor = computed(() => {
  const level = (props.crowd || "").toLowerCase()
  if (level.includes("low") || level.includes("quiet")) return "bg-green-500"
  if (level.includes("moderate") || level.includes("medium")) return "bg-orange-400"
  if (level.includes("high") || level.includes("busy")) return "bg-red-500"
  return "bg-gray-400"
})

const friendHoverText = computed(() => {
  const names = friendsGoing.value.map(f => f.name)
  if (names.length < 3) return names.join(", ")
  const firstThree = names.slice(0, 3)
  const others = names.length - 3
  return `${firstThree.join(", ")} + ${others} others`
})
</script>

<template>
  <Card
    class="pt-0 relative overflow-hidden rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 duration-300 cursor-pointer"
    @click="goToDetails"
  >
    <div class="relative">
      <img
        :src="image"
        :alt="title"
        class="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div
        v-if="isJoined"
        class="absolute top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center backdrop-blur-xs"
      >
        <span
          class="text-white font-semibold text-sm sm:text-base bg-green-400/80 px-4 py-1.5 rounded-full shadow-lg animate-fade-in"
        >
          Joined
        </span>
      </div>

      <!-- Like -->
      <button
        @click.stop="toggleLike"
        class="absolute top-3 right-3 bg-white/90 hover:bg-red-100 text-red-500 rounded-full p-2 shadow-md transition cursor-pointer"
        aria-label="Save event"
      >
        <Heart
          class="w-5 h-5 transition-transform duration-200"
          :class="isLiked ? 'fill-red-500 scale-110' : 'fill-none scale-100'"
        />
      </button>

      <!-- Category -->
      <span
        class="absolute top-3 left-3 text-xs font-medium text-white px-3 py-1 rounded-full"
        :class="categoryColor"
      >
        {{ category }}
      </span>

      <!-- Crowd -->
      <span
        class="absolute bottom-3 right-3 text-xs font-medium text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1"
      >
        <span :class="['w-2 h-2 rounded-full', crowdColor]" />
        {{ crowd }}
      </span>
    </div>

    <CardContent class="px-4">
      <h3 class="font-semibold text-gray-900 text-base truncate mb-1">{{ title }}</h3>
      <p class="text-sm text-gray-500 truncate">{{ location }}</p>

      <div class="mt-2 flex items-center gap-2">
        <!-- People going -->
        <p class="text-blue-600 font-medium text-sm flex items-center gap-1">
          <span v-if="loadingGoing" class="inline-flex items-center gap-2 text-gray-400">
            <span class="h-3 w-3 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></span>
            Loading…
          </span>
          <span v-else>
            {{ goingCount }} {{ goingCount === 1 ? 'person' : 'people' }} going
          </span>
        </p>
        <span>
          •
        </span>
        
        <!-- Friends going -->
         <div class="flex justify-center items-center">
           <div
           v-if="!loadingGoing && friendsGoing.length"
           class="flex -space-x-2 items-center"
           :title="friendHoverText"
           >
           <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <div class="flex -space-x-2 items-center cursor-pointer">
                  <img
                    v-for="(f, index) in friendsGoing.slice(0, 3)"
                    :key="f.id"
                    :src="f.profile_picture || '/default-avatar.png'"
                    :alt="f.name"
                    :style="{
                      left: `${index * 20}%`,
                      zIndex: 10 + index
                    }"
                    class="w-6 h-6 rounded-full border-2 border-white hover:scale-110 transition-all duration-150"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent class="bg-gray-900 text-white text-xs px-2 py-1 rounded">
                {{ friendHoverText }}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          </div>
          <span class="text-gray-500 text-xs">
            {{ friendsGoing.length }} friends going
          </span>
        </div>
      </div>

      <div class="flex justify-between items-center mt-3">
        <span
          class="text-sm font-medium"
          :class="{
            'text-green-600': (price || '').toLowerCase() === 'free',
            'text-black-600': (price || '').toLowerCase() !== 'free',
          }"
        >
          {{ price }}
        </span>
        <span class="text-sm text-gray-400">{{ date }}</span>
      </div>

      <div
        class="mt-2 pt-2 flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-100"
      >
        <ReviewPreview :eventId="id" />
        <div
          v-if="distance !== undefined && distance !== Infinity && !isNaN(distance)"
          class="flex items-center gap-1 text-gray-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zM12 11a2 2 0 110-4 2 2 0 010 4z"/>
          </svg>
          <span class="font-semibold whitespace-nowrap">{{ distance.toFixed(1) }} km</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
