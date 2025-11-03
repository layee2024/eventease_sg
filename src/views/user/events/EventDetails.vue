<script setup>
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { supabase } from "@/utils/supabase"
import { toast } from "vue-sonner"
import { CalendarDays, MapPin, DollarSign, Users, ArrowLeft, Heart } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const route = useRoute()
const router = useRouter()
const event = ref(null)
const loading = ref(true)
const eventId = route.params.id
const isSaved = ref(false)
const isGoing = ref(false)
const goingCount = ref(0)
const user = ref(null)
const friendsGoing = ref([])
const loadingFriends = ref(true)

// Invite functionality
const inviteOpen = ref(false)
const friends = ref([])
const loadingFriends2 = ref(false)
const invitedFriends = ref(new Set())

const friendHoverText = computed(() => {
  const names = friendsGoing.value.map(f => f.name)
  if (names.length <= 3) return names.join(", ")
  const firstThree = names.slice(0, 3)
  const others = names.length - 3
  return `${firstThree.join(", ")} + ${others} others`
})

const reviews = ref([])
const userReview = ref(null)
const reviewText = ref("")
const reviewRating = ref(0)
const editing = computed(() => !!userReview.value)

// Reviews Pagination
const reviewPage = ref(1)
const reviewsPerPage = 5
const totalReviewPages = computed(() => Math.ceil(reviews.value.length / reviewsPerPage))
const paginatedReviews = computed(() => {
  const start = (reviewPage.value - 1) * reviewsPerPage
  return reviews.value.slice(start, start + reviewsPerPage)
})

// Load reviews
async function fetchReviews() {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, user_id, comment, rating, created_at, user_preferences(name, profile_picture)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    toast.error("Failed to load reviews.")
    return
  }

  reviews.value = data || []

  if (user.value) {
    userReview.value = reviews.value.find((r) => r.user_id === user.value.id) || null
    if (userReview.value) {
      reviewText.value = userReview.value.comment
      reviewRating.value = userReview.value.rating
    }
  }
}

// Add or update review
async function submitReview() {
  if (reviewText.value.trim().length < 10) {
    toast.error("Comment must be at least 10 characters.")
    return
  }

  if (!reviewRating.value) {
    toast.error("Please select a rating.")
    return
  }

  const reviewPayload = {
    event_id: eventId,
    user_id: user.value.id,
    comment: reviewText.value.trim(),
    rating: reviewRating.value,
  }

  if (editing.value) {
    const { error } = await supabase
      .from("reviews")
      .update(reviewPayload)
      .eq("id", userReview.value.id)

    if (error) return toast.error("Failed to update review.")
    toast.success("Review updated!")
  } else {
    const { error } = await supabase.from("reviews").insert([reviewPayload])
    if (error) return toast.error("Failed to post review.")
    toast.success("Review posted!")
  }

  await fetchReviews()
}

async function fetchFriendsGoing() {
  loadingFriends.value = true
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      friendsGoing.value = []
      loadingFriends.value = false
      return
    }

    const { data: me, error: meErr } = await supabase
      .from("user_preferences")
      .select("friends")
      .eq("id", authUser.id)
      .single()

    if (meErr) throw meErr

    const friends = me?.friends || []
    if (!friends.length) {
      friendsGoing.value = []
      loadingFriends.value = false
      return
    }

    const { data: goingFriends, error: fErr } = await supabase
      .from("user_preferences")
      .select("id, name, profile_picture, going")
      .in("id", friends)

    if (fErr) throw fErr

    const filtered = (goingFriends || []).filter(f => (f.going || []).includes(eventId))
    friendsGoing.value = filtered
  } catch (err) {
    console.error("Error fetching friends going:", err)
    toast.error("Failed to load friends going")
    friendsGoing.value = []
  } finally {
    loadingFriends.value = false
  }
}

// Fetch all friends for invite modal
async function fetchFriendsForInvite() {
  loadingFriends2.value = true
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      friends.value = []
      return
    }

    const { data: me, error: meErr } = await supabase
      .from("user_preferences")
      .select("friends")
      .eq("id", authUser.id)
      .single()

    if (meErr) throw meErr

    const friendIds = me?.friends || []
    if (!friendIds.length) {
      friends.value = []
      return
    }

    const { data: friendsList, error: fErr } = await supabase
      .from("user_preferences")
      .select("id, name, email, profile_picture, going")
      .in("id", friendIds)

    if (fErr) throw fErr

    friends.value = friendsList || []
  } catch (err) {
    console.error("Error fetching friends for invite:", err)
    toast.error("Failed to load friends")
    friends.value = []
  } finally {
    loadingFriends2.value = false
  }
}

// Send event invite
async function sendEventInvite(targetId) {
  try {
    // Check if already invited
    if (invitedFriends.value.has(targetId)) {
      toast.info("Already invited this friend.")
      return
    }

    // Check if friend is already going
    const friend = friends.value.find(f => f.id === targetId)
    if (friend?.going?.includes(eventId)) {
      toast.info("This friend already joined the event.")
      return
    }

    // Get invite data
    const [{ data: me }, { data: targetInvites }] = await Promise.all([
      supabase
        .from("user_preferences")
        .select("sent_invites")
        .eq("id", user.value.id)
        .single(),
      supabase
        .from("user_preferences")
        .select("invite_requests")
        .eq("id", targetId)
        .single(),
    ])

    // Check if invite already exists
    const alreadyInvited = (targetInvites?.invite_requests || []).some(
      (i) => i.event_id === eventId && i.from === user.value.id
    )

    if (alreadyInvited) {
      toast.info("Invite already sent to this friend.")
      return
    }

    const newSent = [...(me?.sent_invites || []), { event_id: eventId, to: targetId }]
    const newReceived = [...(targetInvites?.invite_requests || []), { event_id: eventId, from: user.value.id }]

    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase
        .from("user_preferences")
        .update({ sent_invites: newSent })
        .eq("id", user.value.id),
      supabase
        .from("user_preferences")
        .update({ invite_requests: newReceived })
        .eq("id", targetId),
    ])

    if (e1 || e2) throw new Error("Failed to update records")

    invitedFriends.value.add(targetId)
    toast.success(`Invited ${friend?.name}!`)
  } catch (err) {
    console.error(err)
    toast.error("Could not send invite.")
  }
}

// Open invite modal
async function openInviteModal() {
  inviteOpen.value = true
  invitedFriends.value.clear()
  await fetchFriendsForInvite()
}

const categoryColor = computed(() => {
  if (!event.value) return "bg-gray-500"
  return (
    {
      Music: "bg-purple-600",
      Food: "bg-orange-500",
      Arts: "bg-pink-500",
      Tech: "bg-blue-600",
      Sports: "bg-green-500",
      Technology: "bg-blue-600",
      Education: "bg-indigo-600",
      Business: "bg-gray-600",
      Culture: "bg-red-500",
      Health: "bg-teal-500",
      Social: "bg-yellow-500",
      Environment: "bg-green-600",
    }[event.value.category] || "bg-gray-500"
  )
})

// Date formatter
function formatDate(start, end) {
  if (!start || !end) return "TBA"
  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }
  const startStr = new Intl.DateTimeFormat("en-SG", options).format(new Date(start))
  const endTime = new Intl.DateTimeFormat("en-SG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(end))
  return `${startStr} - ${endTime}`
}

// Fetch event
async function fetchEvent() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .maybeSingle()

    if (error || !data) {
      toast.error("Event not found")
      return
    }

    event.value = data
    await checkSavedStatus()
    await checkGoingStatus()
    await countGoingUsers()
  } catch (err) {
    console.error(err)
    toast.error("Error fetching event.")
  } finally {
    loading.value = false
  }
}

async function checkSavedStatus() {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) return

  user.value = auth.user

  const { data: pref } = await supabase
    .from("user_preferences")
    .select("saved")
    .eq("id", user.value.id)
    .single()

  isSaved.value = pref?.saved?.includes(eventId) || false
}

async function checkGoingStatus() {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) return

  user.value = auth.user

  const { data: pref } = await supabase
    .from("user_preferences")
    .select("going")
    .eq("id", user.value.id)
    .single()

  isGoing.value = pref?.going?.includes(eventId) || false
}

async function countGoingUsers() {
  const { count } = await supabase
    .from("user_preferences")
    .select("id", { count: "exact", head: true })
    .contains("going", [eventId])

  goingCount.value = count || 0
}

async function toggleSave() {
  if (!user.value) return toast.error("Please login to save events")

  isSaved.value = !isSaved.value

  const { data: pref } = await supabase
    .from("user_preferences")
    .select("saved")
    .eq("id", user.value.id)
    .single()

  let updated = pref?.saved || []
  if (isSaved.value) {
    if (!updated.includes(eventId)) updated.push(eventId)
    toast.success("Added to saved events")
  } else {
    updated = updated.filter((id) => id !== eventId)
    toast.info("Removed from saved events")
  }

  await supabase.from("user_preferences").update({ saved: updated }).eq("id", user.value.id)
}

async function toggleJoinEvent() {
  if (!user.value) return toast.error("Please login to join events")

  const { data: pref } = await supabase
    .from("user_preferences")
    .select("going")
    .eq("id", user.value.id)
    .single()

  let updated = pref?.going || []
  if (isGoing.value) {
    updated = updated.filter((id) => id !== eventId)
    toast.info(`You left ${event.value.title}`)
  } else {
    if (!updated.includes(eventId)) updated.push(eventId)
    toast.success(`You joined ${event.value.title}!`)
  }

  await supabase.from("user_preferences").update({ going: updated }).eq("id", user.value.id)
  isGoing.value = !isGoing.value
  await countGoingUsers()
}

onMounted(async () => {
  await fetchEvent()
  await fetchReviews()
  await fetchFriendsGoing()
})
</script>

<template>
  <section class="min-h-min">
    <div v-if="loading" class="flex justify-center items-center h-[80vh]">
      <div class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    </div>

    <div v-else-if="event" class="relative max-w-5xl mx-auto bg-white dark:bg-gray-200 shadow-md rounded-lg overflow-hidden my-10">
      <Button
        variant="outline"
        @click="route.query.from === 'shuffle' ? router.push('/shuffle') : router.push('/events')"
        class="absolute top-4 left-4 z-20 flex items-center gap-2 dark:bg-white dark:border-gray-400 bg-white/90 backdrop-blur-md shadow-sm hover:bg-gray-200 cursor-pointer"
      >
        <ArrowLeft class="w-4 h-4" />
        Back
      </Button>

      <!-- Header -->
      <div class="relative">
        <img :src="event.image_url" alt="Event banner" class="w-full h-72 object-cover" />
        <div
          class="absolute top-4 right-4 text-white text-sm font-medium px-3 py-1 rounded-lg shadow-sm"
          :class="categoryColor"
        >
          {{ event.category }}
        </div>
      </div>

      <!-- Content -->
      <div class="p-8">
        <h1 class="text-3xl font-extrabold text-gray-900 mb-6">
          {{ event.title }}
        </h1>

        <p class="text-gray-600 text-lg leading-relaxed mb-8">
          {{ event.description }}
        </p>

        <!-- Info -->
        <div class="grid md:grid-cols-2 gap-6">
          <div class="bg-gray-50 rounded-xl p-5 space-y-5 border border-gray-100">
            <div class="flex items-start gap-3 text-gray-800">
              <CalendarDays class="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p class="font-semibold">Date & Time</p>
                <p class="text-gray-600 text-sm">{{ formatDate(event.start_date, event.end_date) }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3 text-gray-800">
              <MapPin class="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p class="font-semibold">Location</p>
                <p class="text-gray-600 text-sm">{{ event.venue }}</p>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 rounded-xl p-5 space-y-5 border border-gray-100">
            <div class="flex items-start gap-3 text-gray-800">
              <DollarSign class="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p class="font-semibold">Price</p>
                <p class="text-gray-600 text-sm">
                  {{ event.ticket_price === 0 ? "Free" : `$${event.ticket_price}` }}
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3 text-gray-800">
              <Users class="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p class="font-semibold">Crowd Level</p>
                <p class="text-gray-600 text-sm">{{ event.crowd_level || "N/A" }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Save & Join & Invite -->
        <div class="mt-4 flex flex-col md:flex-row md:justify-between items-center gap-8 md:gap-2">
          <div class="flex items-center gap-3">
            <p class="text-blue-600 font-medium">
              {{ goingCount }} {{ goingCount === 1 ? "person is" : "people are" }} going
            </p>

            
            <!-- Friends going avatars -->
            <div v-if="!loadingFriends && friendsGoing.length" class="flex items-center gap-2">
              <span class="text-gray-500 text-xs"> • </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger as-child>
                      {{ friendsGoing.length }} friend{{ friendsGoing.length > 1 ? "s" : "" }} going
                  </TooltipTrigger>
                  <TooltipContent class="bg-gray-900 text-white text-xs px-2 py-1 rounded">
                    {{ friendHoverText }}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

            </div>
          </div>

          <!-- Save & Join & Invite Buttons -->
          <div class="flex gap-3">
            <Button @click="toggleSave" :variant="isSaved ? 'secondary' : 'light:outline'" class="cursor-pointer flex items-center gap-2">
              <Heart
                :class="[
                  'w-4 h-4',
                  isSaved ? 'fill-red-500 text-red-500' : 'fill-none text-gray-600',
                ]"
              />
              {{ isSaved ? "Saved" : "Save" }}
            </Button>

            <Button :variant="isGoing ? 'secondary' : 'default'" class="cursor-pointer" @click="toggleJoinEvent">
              {{ isGoing ? "Leave Event" : "Join Event" }}
            </Button>

            <Button
              v-if="isGoing"
              variant="outline"
              class="cursor-pointer dark:bg-white dark:border-gray-400"
              @click="openInviteModal"
            >
              Invite Friends
            </Button>
          </div>
        </div>

        <!-- Map -->
        <div class="mt-10 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <iframe
            v-if="event.latitude && event.longitude"
            :src="`https://www.google.com/maps?q=${event.latitude},${event.longitude}&hl=en&z=15&output=embed`"
            width="100%"
            height="350"
            allowfullscreen
            loading="lazy"
            class="rounded-xl"
          ></iframe>

          <div v-else class="flex items-center justify-center h-64 bg-gray-100 text-gray-500">
            Map unavailable
          </div>
        </div>

        <!-- Reviews -->
        <div class="mt-12 border-t border-gray-200 pt-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>

          <!-- Review Form -->
          <div v-if="user" class="mb-6 bg-gray-50 border p-5 rounded-lg">
            <p class="font-semibold text-gray-800 mb-2">
              {{ editing ? "Update your review" : "Leave a review" }}
            </p>

            <!-- Star Rating -->
            <div class="flex gap-1 mb-3">
              <span
                v-for="star in 5"
                :key="star"
                class="text-2xl cursor-pointer transition"
                :class="star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'"
                @click="reviewRating = star"
              >
                ★
              </span>
            </div>

            <textarea
              v-model="reviewText"
              placeholder="Write your review (min 10 characters)"
              class="w-full border border-gray-300 rounded-lg p-3 text-gray-700 resize-none focus:ring focus:ring-blue-200"
              rows="3"
            ></textarea>

            <div class="flex justify-end mt-3">
              <Button class="cursor-pointer" @click="submitReview">
                {{ editing ? "Update Review" : "Submit Review" }}
              </Button>
            </div>
          </div>

          <!-- Reviews List -->
          <div v-if="reviews.length" class="space-y-5">
            <div v-for="r in paginatedReviews" :key="r.id" class="p-4 border border-gray-200 rounded-lg bg-white">
              <div class="flex items-center gap-3 mb-1">
                <img :src="r.user_preferences?.profile_picture || '/default-avatar.png'" class="w-10 h-10 rounded-full object-cover border" />
                <p class="font-semibold text-gray-900">{{ r.user_preferences?.name }}</p>
              </div>

              <div class="flex text-yellow-400 mb-1">
                <span v-for="n in r.rating" :key="n">★</span>
                <span v-for="n in 5 - r.rating" :key="'empty' + n" class="text-gray-300">★</span>
              </div>

              <p class="text-gray-700">{{ r.comment }}</p>
              <p class="text-xs text-gray-500 mt-1">
                {{ new Date(r.created_at).toLocaleString("en-SG") }}
              </p>
            </div>

            <!-- Pagination -->
            <div v-if="totalReviewPages > 1" class="flex items-center justify-center gap-4 mt-5">
              <Button
                variant="outline"
                :disabled="reviewPage === 1"
                @click="reviewPage--"
                class="cursor-pointer"
              >
                Previous
              </Button>

              <span class="text-gray-700 text-sm">
                {{ reviewPage }} of {{ totalReviewPages }}
              </span>

              <Button
                variant="outline"
                :disabled="reviewPage === totalReviewPages"
                @click="reviewPage++"
                class="cursor-pointer"
              >
                Next
              </Button>
            </div>
          </div>

          <p v-else class="text-gray-500 text-center py-6">No reviews yet.</p>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20 text-gray-600">
      <p>Event not found.</p>
      <Button @click="router.push('/events')" variant="ghost" class="mt-4">
        Back to Events
      </Button>
    </div>

    <!-- Invite Friends Dialog -->
    <Dialog v-model:open="inviteOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Friends to {{ event?.title }}</DialogTitle>
        </DialogHeader>

        <div v-if="loadingFriends2" class="flex justify-center py-6">
          <div class="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>

        <div v-else-if="friends.length" class="space-y-3 max-h-96 overflow-y-auto">
          <div
            v-for="friend in friends"
            :key="friend.id"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div class="flex items-center gap-3">
              <img :src="friend.profile_picture || '/default-avatar.png'" class="w-10 h-10 rounded-full object-cover" />
              <div>
                <p class="font-semibold text-gray-900 dark:text-gray-300">{{ friend.name }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-300">{{ friend.email }}</p>
              </div>
            </div>

            <Button
              size="sm"
              :variant="invitedFriends.has(friend.id) || friend.going?.includes(eventId) ? 'secondary' : 'default'"
              class="cursor-pointer"
              :disabled="invitedFriends.has(friend.id) || friend.going?.includes(eventId)"
              @click="sendEventInvite(friend.id)"
            >
              {{
                friend.going?.includes(eventId)
                  ? "Joined"
                  : invitedFriends.has(friend.id)
                    ? "Invited"
                    : "Invite"
              }}
            </Button>
          </div>
        </div>

        <p v-else class="text-gray-500 text-center py-6">No friends to invite.</p>
      </DialogContent>
    </Dialog>
  </section>
</template>
