<script setup>
import { ref, onMounted, computed } from "vue"
import { supabase } from "../../utils/supabase"
import { toast } from "vue-sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { CalendarDays, Plus, Edit, Trash2, TrendingUp, Users, Star, DollarSign } from "lucide-vue-next"
import { format } from "date-fns"

const loading = ref(true)
const organiserId = ref(null)
const myEvents = ref([])
const stats = ref({
  totalEvents: 0,
  totalAttendance: 0,
  averageRating: 0,
  totalRevenue: 0
})

// Event Form
const eventDialogOpen = ref(false)
const editingEvent = ref(null)
const eventForm = ref({
  title: "",
  description: "",
  category: "",
  venue: "",
  address: "",
  latitude: "",
  longitude: "",
  start_date: null,
  end_date: null,
  ticket_price: 0,
  image_url: "",
  website_url: "",
  max_capacity: "",
  crowd_level: "low",
  tags: ""
})

const categories = [
  "Music", "Food", "Arts", "Technology", "Sports",
  "Education", "Business", "Culture", "Health", "Social", "Environment"
]

const crowdLevels = ["low", "moderate", "high"]

// Fetch organiser events and stats
async function fetchDashboardData() {
  loading.value = true
  
  // Temporarily hardcode organiser ID for testing
  organiserId.value = '189659e4-f321-4084-854e-951f5be06ac9'
  
  // const { data: { user } } = await supabase.auth.getUser()
  // if (!user) {
  //   toast.error("Please log in as an organiser.")
  //   loading.value = false
  //   return
  // }
  // organiserId.value = user.id

  // Fetch events
  const { data: events, error: eventsError } = await supabase
    .from("events_organiser")
    .select("*")
    .eq("organiser_id", organiserId.value)
    .order("created_at", { ascending: false })

  if (eventsError) {
    console.error(eventsError)
    toast.error("Failed to load events.")
  } else {
    myEvents.value = events || []
    calculateStats(events || [])
  }

  loading.value = false
}

// Calculate statistics
async function calculateStats(events) {
  stats.value.totalEvents = events.length
  stats.value.totalAttendance = events.reduce((sum, e) => sum + (e.current_attendance || 0), 0)
  stats.value.totalRevenue = events.reduce((sum, e) => sum + (e.ticket_price * (e.current_attendance || 0)), 0)

  // Calculate average rating from reviews
  if (events.length > 0) {
    const eventIds = events.map(e => e.id)
    const { data: reviews } = await supabase
      .from("reviews_organiser")
      .select("rating")
      .in("event_id", eventIds)

    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      stats.value.averageRating = avgRating.toFixed(1)
    } else {
      stats.value.averageRating = 0
    }
  }
}

// Open dialog for new event
function openNewEventDialog() {
  editingEvent.value = null
  resetForm()
  eventDialogOpen.value = true
}

// Open dialog for editing event
function openEditEventDialog(event) {
  editingEvent.value = event
  eventForm.value = {
    title: event.title,
    description: event.description,
    category: event.category,
    venue: event.venue,
    address: event.address,
    latitude: event.latitude?.toString() || "",
    longitude: event.longitude?.toString() || "",
    start_date: event.start_date ? new Date(event.start_date) : null,
    end_date: event.end_date ? new Date(event.end_date) : null,
    ticket_price: event.ticket_price || 0,
    image_url: event.image_url || "",
    website_url: event.website_url || "",
    max_capacity: event.max_capacity?.toString() || "",
    crowd_level: event.crowd_level || "low",
    tags: Array.isArray(event.tags) ? event.tags.join(", ") : ""
  }
  eventDialogOpen.value = true
}

// Reset form
function resetForm() {
  eventForm.value = {
    title: "",
    description: "",
    category: "",
    venue: "",
    address: "",
    latitude: "",
    longitude: "",
    start_date: null,
    end_date: null,
    ticket_price: 0,
    image_url: "",
    website_url: "",
    max_capacity: "",
    crowd_level: "low",
    tags: ""
  }
}

// Save event (create or update)
async function saveEvent() {
  // Validation
  if (!eventForm.value.title || !eventForm.value.category || !eventForm.value.start_date || !eventForm.value.end_date) {
    toast.error("Please fill in all required fields.")
    return
  }

  // Use hardcoded ID for testing
  organiserId.value = '189659e4-f321-4084-854e-951f5be06ac9'
  console.log("Organiser ID:", organiserId.value)

  const payload = {
    organiser_id: organiserId.value,
    title: eventForm.value.title,
    description: eventForm.value.description,
    category: eventForm.value.category,
    venue: eventForm.value.venue,
    address: eventForm.value.address,
    start_date: new Date(eventForm.value.start_date).toISOString(),
    end_date: new Date(eventForm.value.end_date).toISOString(),
    ticket_price: parseFloat(eventForm.value.ticket_price) || 0,
    image_url: eventForm.value.image_url,
    website_url: eventForm.value.website_url,
    max_capacity: eventForm.value.max_capacity ? parseInt(eventForm.value.max_capacity) : null,
    crowd_level: eventForm.value.crowd_level,
    tags: eventForm.value.tags ? eventForm.value.tags.split(",").map(t => t.trim()) : [],
    updated_at: new Date().toISOString()
  }

  let error

  if (editingEvent.value) {
    // Update existing event
    const result = await supabase
      .from("events_organiser")
      .update(payload)
      .eq("id", editingEvent.value.id)
    error = result.error
  } else {
    // Create new event
    const result = await supabase
      .from("events_organiser")
      .insert(payload)
    error = result.error
  }

  if (error) {
    console.error(error)
    toast.error("Failed to save event.")
  } else {
    toast.success(editingEvent.value ? "Event updated!" : "Event created!")
    eventDialogOpen.value = false
    await fetchDashboardData()
  }
}

// Delete event
async function deleteEvent(eventId) {
  if (!confirm("Are you sure you want to delete this event?")) return

  const { error } = await supabase
    .from("events_organiser")
    .delete()
    .eq("id", eventId)

  if (error) {
    console.error(error)
    toast.error("Failed to delete event.")
  } else {
    toast.success("Event deleted.")
    await fetchDashboardData()
  }
}

// Format date for display
function formatDate(date) {
  if (!date) return "N/A"
  return format(new Date(date), "MMM dd, yyyy h:mm a")
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="px-6 py-10 max-w-7xl mx-auto min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Organiser Dashboard</h1>
        <p class="text-gray-500 mt-1">Manage your events and view statistics</p>
      </div>
      <Button @click="openNewEventDialog" class="flex items-center gap-2">
        <Plus class="w-4 h-4" />
        Create Event
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-20">
      <p class="text-gray-500">Loading dashboard...</p>
    </div>

    <div v-else>
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium text-gray-600">Total Events</CardTitle>
            <TrendingUp class="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.totalEvents }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium text-gray-600">Total Attendance</CardTitle>
            <Users class="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.totalAttendance }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium text-gray-600">Average Rating</CardTitle>
            <Star class="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.averageRating || "N/A" }}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign class="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">${{ stats.totalRevenue.toFixed(2) }}</div>
          </CardContent>
        </Card>
      </div>

      <!-- Events List -->
      <Card>
        <CardHeader>
          <CardTitle>My Events</CardTitle>
          <CardDescription>Manage all your created events</CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="myEvents.length === 0" class="text-center py-12 text-gray-500">
            <p>No events yet. Create your first event!</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="event in myEvents"
              :key="event.id"
              class="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900">{{ event.title }}</h3>
                  <p class="text-sm text-gray-500 mt-1">{{ event.category }}</p>
                  <div class="flex gap-4 mt-2 text-sm text-gray-600">
                    <span class="flex items-center gap-1">
                      <CalendarDays class="w-4 h-4" />
                      {{ formatDate(event.start_date) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <Users class="w-4 h-4" />
                      {{ event.current_attendance || 0 }} / {{ event.max_capacity || "∞" }}
                    </span>
                    <span class="flex items-center gap-1">
                      <DollarSign class="w-4 h-4" />
                      {{ event.ticket_price === 0 ? "Free" : `$${event.ticket_price}` }}
                    </span>
                  </div>
                </div>

                <div class="flex gap-2">
                  <Button variant="outline" size="sm" @click="openEditEventDialog(event)">
                    <Edit class="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" @click="deleteEvent(event.id)">
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Event Dialog -->
    <Dialog v-model:open="eventDialogOpen">
      <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ editingEvent ? "Edit Event" : "Create New Event" }}</DialogTitle>
        </DialogHeader>

        <div class="grid gap-4 py-4">
          <!-- Title -->
          <div class="grid gap-2">
            <Label for="title">Title *</Label>
            <Input id="title" v-model="eventForm.title" placeholder="Event title" />
          </div>

          <!-- Description -->
          <div class="grid gap-2">
            <Label for="description">Description</Label>
            <Textarea id="description" v-model="eventForm.description" placeholder="Event description" rows="3" />
          </div>

          <!-- Category -->
          <div class="grid gap-2">
            <Label for="category">Category *</Label>
            <Select v-model="eventForm.category">
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="cat in categories" :key="cat" :value="cat">
                  {{ cat }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Venue & Address -->
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
              <Label for="venue">Venue</Label>
              <Input id="venue" v-model="eventForm.venue" placeholder="Venue name" />
            </div>
            <div class="grid gap-2">
              <Label for="address">Address</Label>
              <Input id="address" v-model="eventForm.address" placeholder="Street address" />
            </div>
          </div>

          <!-- Start & End Date -->
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger as-child>
                  <Button variant="outline" class="justify-start text-left font-normal">
                    <CalendarDays class="mr-2 h-4 w-4" />
                    {{ eventForm.start_date ? format(eventForm.start_date, "PPP") : "Pick a date" }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0">
                  <Calendar v-model="eventForm.start_date" />
                </PopoverContent>
              </Popover>
            </div>
            <div class="grid gap-2">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger as-child>
                  <Button variant="outline" class="justify-start text-left font-normal">
                    <CalendarDays class="mr-2 h-4 w-4" />
                    {{ eventForm.end_date ? format(eventForm.end_date, "PPP") : "Pick a date" }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0">
                  <Calendar v-model="eventForm.end_date" />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <!-- Ticket Price & Max Capacity -->
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
              <Label for="price">Ticket Price ($)</Label>
              <Input id="price" v-model="eventForm.ticket_price" type="number" step="0.01" placeholder="0.00" />
            </div>
            <div class="grid gap-2">
              <Label for="capacity">Max Capacity</Label>
              <Input id="capacity" v-model="eventForm.max_capacity" type="number" placeholder="Unlimited" />
            </div>
          </div>

          <!-- Crowd Level -->
          <div class="grid gap-2">
            <Label for="crowd">Expected Crowd Level</Label>
            <Select v-model="eventForm.crowd_level">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="level in crowdLevels" :key="level" :value="level">
                  {{ level.charAt(0).toUpperCase() + level.slice(1) }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Image URL -->
          <div class="grid gap-2">
            <Label for="image">Image URL</Label>
            <Input id="image" v-model="eventForm.image_url" placeholder="https://example.com/image.jpg" />
          </div>

          <!-- Website URL -->
          <div class="grid gap-2">
            <Label for="website">Website URL</Label>
            <Input id="website" v-model="eventForm.website_url" placeholder="https://example.com" />
          </div>

          <!-- Tags -->
          <div class="grid gap-2">
            <Label for="tags">Tags (comma-separated)</Label>
            <Input id="tags" v-model="eventForm.tags" placeholder="outdoor, family-friendly, free" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="eventDialogOpen = false">Cancel</Button>
          <Button @click="saveEvent">{{ editingEvent ? "Update" : "Create" }} Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
