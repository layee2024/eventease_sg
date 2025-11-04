<script setup>
import { ref, onMounted, computed } from "vue"
import { supabase } from "@/utils/supabase"
import EventCard from "@/components/comp/user/EventCard.vue"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "vue-sonner"

const savedEvents = ref([])
const savedIds = ref([])
const savedSchedules = ref([])
const loading = ref(true)
const today = new Date().toISOString()
const viewMode = ref("events")

const selectedSchedule = ref(null)
const showViewModal = ref(false)


const showDeleteModal = ref(false)
const scheduleToDelete = ref(null)

const currentPage = ref(1)
const eventsPerPage = 20

const totalPages = computed(() => Math.ceil(savedEvents.value.length / eventsPerPage))
const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * eventsPerPage
  const end = start + eventsPerPage
  return savedEvents.value.slice(start, end)
})

// Load saved events
async function loadSavedEvents() {
  loading.value = true
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    savedEvents.value = []
    loading.value = false
    return
  }

  const { data: pref, error: prefErr } = await supabase
    .from("user_preferences")
    .select("saved")
    .eq("id", user.id)
    .single()

  if (prefErr) {
    console.error("Error fetching preferences:", prefErr)
    loading.value = false
    return
  }

  savedIds.value = pref?.saved || []

  if (savedIds.value.length === 0) {
    savedEvents.value = []
    loading.value = false
    return
  }

  const { data: events, error: eventErr } = await supabase
    .from("events")
    .select("*")
    .gte("end_date", today)
    .in("id", savedIds.value)

  if (eventErr) {
    console.error("Error fetching saved events:", eventErr)
  } else {
    savedEvents.value = events || []
  }

  loading.value = false
}

// Load saved schedules
async function loadSavedSchedules() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data, error } = await supabase
    .from("user_preferences")
    .select("saved_schedules")
    .eq("id", user.id)
    .single()

  if (error) {
    console.error("Error fetching saved schedules:", error)
    return
  }

  savedSchedules.value = data?.saved_schedules || []
}

// Remove schedule
async function deleteSchedule(scheduleIndex) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const updated = [...savedSchedules.value]
  updated.splice(scheduleIndex, 1)

  const { error } = await supabase
    .from("user_preferences")
    .update({ saved_schedules: updated })
    .eq("id", user.id)

  if (error) {
    console.error("Error deleting schedule:", error)
    toast.error("Failed to delete schedule.")
  } else {
    savedSchedules.value = updated
    toast.success("Schedule deleted.")
  }
  showDeleteModal.value = false
}

// Event pagination
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
}

function handleSavedUpdate({ id, liked }) {
  if (!liked) {
    savedEvents.value = savedEvents.value.filter(e => e.id !== id)
    savedIds.value = savedIds.value.filter(x => x !== id)
  }
}

onMounted(async () => {
  await loadSavedEvents()
  await loadSavedSchedules()
})
</script>

<template>
  <section class="py-12 px-6 md:px-12 xl:px-20 bg-white dark:bg-[#121212] min-h-screen">
    <!-- Header -->
    <div class="flex flex-col mb-8 items-center">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Saved Items</h2>
      <p class="text-gray-400 mt-2">
        View all your saved events and schedules
      </p>
    </div>

    <!-- Toggle Tabs -->
    <div class="flex justify-center gap-4 mb-10">
      <Button
        :variant="viewMode === 'events' ? 'default' : 'outline'"
        @click="viewMode = 'events'"
        class="cursor-pointer dark:text-white"
        :class="{'dark:text-black': viewMode == 'events'}"
      >
        Events
      </Button>
      <Button
        :variant="viewMode === 'schedules' ? 'default' : 'outline'"
        @click="viewMode = 'schedules'"
        class="cursor-pointer dark: text-white"
        :class="{'dark:text-black': viewMode == 'schedules'}"
      >
        Schedules
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-10 text-gray-500 dark:text-white">
      Loading your saved items...
    </div>

    <!-- Events -->
    <div v-else-if="viewMode === 'events'">
      <div v-if="!savedEvents.length" class="text-center py-16 text-gray-500 dark:text-white">
        <p class="text-lg">You haven't saved any events yet.</p>
        <p class="text-sm text-gray-400 mt-1">
          Explore events and tap the saved icon to save them here!
        </p>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <EventCard
            v-for="event in paginatedEvents"
            :key="event.id"
            :id="event.id"
            :title="event.title"
            :category="event.category"
            :categoryColor="{
              Music: 'bg-purple-600',
              Food: 'bg-orange-500',
              Arts: 'bg-pink-500',
              Tech: 'bg-blue-600',
              Sports: 'bg-green-500',
            }[event.category] || 'bg-gray-500'"
            :location="event.venue || 'Unknown venue'"
            :price="event.ticket_price === 0 ? 'Free' : `$${event.ticket_price}`"
            :date="new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })"
            :crowd="event.crowd_level"
            :image="event.image_url"
            liked
            @update-saved="handleSavedUpdate"
          />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex flex-col items-center justify-center mt-10">
          <div class="flex gap-3 items-center">
            <Button variant="outline" :disabled="currentPage === 1" @click="prevPage">Previous</Button>
            <span class="text-gray-700 dark:text-white font-medium">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <Button variant="outline" :disabled="currentPage === totalPages" @click="nextPage">Next</Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedules -->
    <div v-else>
      <div v-if="!savedSchedules.length" class="text-center py-16 text-gray-500 dark:text-white">
        <p class="text-lg">You haven't saved any schedules yet.</p>
        <p class="text-sm text-gray-400 mt-1">
          Plan a day with AI and save it here!
        </p>
      </div>
      <div v-else class="flex justify-center mt-6">
        <div class="overflow-x-auto w-full max-w-4xl px-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Created at</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="(sched, index) in savedSchedules"
                :key="index"
                class="hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white"
              >
                <TableCell class="font-semibold">{{ index + 1 }}</TableCell>
                <TableCell>{{ sched.title }}</TableCell>
                <TableCell>
                  {{
                    new Date(sched.created_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })
                  }}
                </TableCell>
                <TableCell class="space-x-2">
                  <Dialog v-model:open="showViewModal">
                    <DialogTrigger as-child>
                      <Button variant="outline" size="sm" @click="selectedSchedule = sched" class="cursor-pointer">
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent class="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{{ selectedSchedule?.title }}</DialogTitle>
                        <DialogDescription>{{ selectedSchedule?.intro }}</DialogDescription>
                      </DialogHeader>
                      <ul class="text-sm text-gray-700 dark:text-gray-200 mt-4 space-y-2 max-h-[300px] overflow-y-auto">
                        <li v-for="(item, i) in selectedSchedule?.schedule" :key="i">
                          <strong>{{ item.start }}</strong> - {{ item.activity }}
                        </li>
                      </ul>
                    </DialogContent>
                  </Dialog>

                  <!-- Delete Confirmation -->
                  <Dialog v-model:open="showDeleteModal">
                    <DialogTrigger as-child>
                      <Button
                        variant="destructive"
                        size="sm"
                        @click="scheduleToDelete = index"
                        class="cursor-pointer"
                      >
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Schedule</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this schedule? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter class="flex justify-end gap-3">
                        <Button class="cursor-pointer" variant="outline" @click="showDeleteModal = false">Cancel</Button>
                        <Button
                        class="cursor-pointer"
                          variant="destructive"
                          @click="deleteSchedule(scheduleToDelete)"
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  </section>
</template>
