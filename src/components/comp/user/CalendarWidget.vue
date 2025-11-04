<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/utils/supabase'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  parseISO,
  isBefore,
  isAfter,
  startOfDay
} from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'vue-sonner'

const props = defineProps({
  maxUpcomingEvents: {
    type: Number,
    default: 5
  }
})

// State
const currentMonth = ref(new Date())
const selectedDate = ref(new Date())
const savedEvents = ref([])
const loading = ref(true)
const userId = ref(null)

// Computed
const calendarDays = computed(() => {
  const start = startOfWeek(startOfMonth(currentMonth.value))
  const end = endOfWeek(endOfMonth(currentMonth.value))
  return eachDayOfInterval({ start, end })
})

const monthYear = computed(() => format(currentMonth.value, 'MMMM yyyy'))

const daysWithEvents = computed(() => {
  const daysMap = new Map()
  savedEvents.value.forEach(event => {
    const eventDate = parseISO(event.start_date)
    const dateKey = format(eventDate, 'yyyy-MM-dd')
    if (!daysMap.has(dateKey)) {
      daysMap.set(dateKey, [])
    }
    daysMap.get(dateKey).push(event)
  })
  return daysMap
})

const upcomingEvents = computed(() => {
  const today = startOfDay(new Date())
  return savedEvents.value
    .filter(event => {
      const eventDate = parseISO(event.start_date)
      return isAfter(eventDate, today) || isSameDay(eventDate, today)
    })
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .slice(0, props.maxUpcomingEvents)
})

const selectedDateEvents = computed(() => {
  const dateKey = format(selectedDate.value, 'yyyy-MM-dd')
  return daysWithEvents.value.get(dateKey) || []
})

// Methods
const hasEvents = (day) => {
  const dateKey = format(day, 'yyyy-MM-dd')
  return daysWithEvents.value.has(dateKey)
}

const getEventCount = (day) => {
  const dateKey = format(day, 'yyyy-MM-dd')
  return daysWithEvents.value.get(dateKey)?.length || 0
}

const isCurrentMonth = (day) => {
  return format(day, 'M') === format(currentMonth.value, 'M')
}

const selectDate = (day) => {
  selectedDate.value = day
}

const previousMonth = () => {
  currentMonth.value = subMonths(currentMonth.value, 1)
}

const nextMonth = () => {
  currentMonth.value = addMonths(currentMonth.value, 1)
}

const goToToday = () => {
  currentMonth.value = new Date()
  selectedDate.value = new Date()
}

const formatEventTime = (dateString) => {
  return format(parseISO(dateString), 'h:mm a')
}

const formatEventDate = (dateString) => {
  return format(parseISO(dateString), 'EEE, MMM d')
}

const goToEventDetails = (eventId) => {
  window.location.href = `/event/${eventId}`
}

const fetchSavedEvents = async () => {
  try {
    loading.value = true

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      loading.value = false
      return
    }

    userId.value = user.id

    // Get user's saved event IDs
    const { data: userPrefs, error: prefsError } = await supabase
      .from('user_preferences')
      .select('saved, going')
      .eq('id', user.id)
      .single()

    if (prefsError) throw prefsError

    // Combine saved and going events
    const eventIds = [...new Set([...(userPrefs.saved || []), ...(userPrefs.going || [])])]

    if (eventIds.length === 0) {
      savedEvents.value = []
      loading.value = false
      return
    }

    // Fetch event details
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, start_date, end_date, venue, category, image_url')
      .in('id', eventIds)
      .order('start_date', { ascending: true })

    if (eventsError) throw eventsError

    savedEvents.value = events || []
  } catch (error) {
    console.error('Error fetching saved events:', error)
    toast.error('Failed to load calendar events')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchSavedEvents()
})
</script>

<template>
  <div class="w-full space-y-4">
    <!-- Quick Action Bar -->
    <div class="flex items-center justify-between gap-2">
      <div class="text-xs sm:text-sm text-muted-foreground hidden sm:block">
        View your upcoming events and saved activities
      </div>
      <div class="text-xs text-muted-foreground sm:hidden">
        Your saved events
      </div>
      <Button
        variant="outline"
        size="sm"
        @click="goToToday"
        class="text-xs flex-shrink-0"
      >
        <Calendar class="h-3 w-3 sm:mr-1" />
        <span class="hidden sm:inline">Today</span>
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
        <div class="flex items-center justify-between">
          <Skeleton class="h-8 w-32" />
          <div class="flex gap-2">
            <Skeleton class="h-8 w-8" />
            <Skeleton class="h-8 w-8" />
          </div>
        </div>
        <Skeleton class="h-64 w-full" />
      </div>

      <!-- Calendar Content -->
      <div v-else>
        <!-- Month Navigation -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold">{{ monthYear }}</h3>
          <div class="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              @click="previousMonth"
              class="h-8 w-8"
            >
              <ChevronLeft class="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              @click="nextMonth"
              class="h-8 w-8"
            >
              <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="space-y-2">
          <!-- Week Day Headers -->
          <div class="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
            <div
              v-for="day in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']"
              :key="day"
              class="text-center text-[10px] sm:text-xs font-medium text-muted-foreground py-1"
            >
              {{ day }}
            </div>
          </div>

          <!-- Calendar Days -->
          <div class="grid grid-cols-7 gap-0.5 sm:gap-1">
            <button
              v-for="day in calendarDays"
              :key="day.toString()"
              @click="selectDate(day)"
              :class="[
                'relative aspect-square flex items-center justify-center rounded-md text-xs sm:text-sm transition-all hover:bg-accent touch-manipulation',
                !isCurrentMonth(day) && 'text-muted-foreground opacity-50',
                isToday(day) && 'bg-primary text-primary-foreground font-semibold hover:bg-primary/90',
                isSameDay(day, selectedDate) && !isToday(day) && 'bg-accent ring-2 ring-primary',
                hasEvents(day) && !isToday(day) && 'font-medium'
              ]"
            >
              <span>{{ format(day, 'd') }}</span>

              <!-- Event Indicator Dots -->
              <div
                v-if="hasEvents(day)"
                class="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5"
              >
                <div
                  v-for="i in Math.min(getEventCount(day), 3)"
                  :key="i"
                  :class="[
                    'h-1 w-1 rounded-full',
                    isToday(day) ? 'bg-primary-foreground' : 'bg-primary'
                  ]"
                />
              </div>
            </button>
          </div>
        </div>

        <!-- Selected Date Events -->
        <div v-if="selectedDateEvents.length > 0" class="mt-6 pt-4 border-t">
          <h4 class="text-sm font-semibold mb-3">
            Events on {{ formatEventDate(selectedDate.toISOString()) }}
          </h4>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <button
              v-for="event in selectedDateEvents"
              :key="event.id"
              @click="goToEventDetails(event.id)"
              class="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent transition-colors touch-manipulation"
            >
              <div class="flex items-start gap-2 sm:gap-3">
                <div
                  v-if="event.image_url"
                  class="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded overflow-hidden bg-muted"
                >
                  <img
                    :src="event.image_url"
                    :alt="event.title"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm truncate">{{ event.title }}</p>
                  <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1 text-xs text-muted-foreground">
                    <span class="flex items-center gap-1">
                      <Clock class="h-3 w-3 flex-shrink-0" />
                      {{ formatEventTime(event.start_date) }}
                    </span>
                    <span v-if="event.venue" class="flex items-center gap-1 truncate">
                      <MapPin class="h-3 w-3 flex-shrink-0" />
                      <span class="truncate">{{ event.venue }}</span>
                    </span>
                  </div>
                </div>
                <Badge variant="secondary" class="flex-shrink-0 text-[10px] sm:text-xs">
                  {{ event.category }}
                </Badge>
              </div>
            </button>
          </div>
        </div>

        <!-- Upcoming Events -->
        <div v-if="upcomingEvents.length > 0" class="mt-6 pt-4 border-t">
          <h4 class="text-sm font-semibold mb-3">Upcoming Events</h4>
          <div class="space-y-2">
            <button
              v-for="event in upcomingEvents"
              :key="event.id"
              @click="goToEventDetails(event.id)"
              class="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent transition-colors touch-manipulation"
            >
              <div class="flex items-start gap-2 sm:gap-3">
                <div
                  v-if="event.image_url"
                  class="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded overflow-hidden bg-muted"
                >
                  <img
                    :src="event.image_url"
                    :alt="event.title"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm truncate">{{ event.title }}</p>
                  <div class="flex flex-col gap-1 mt-1 text-xs text-muted-foreground">
                    <span class="flex items-center gap-1">
                      <Calendar class="h-3 w-3 flex-shrink-0" />
                      <span class="truncate">{{ formatEventDate(event.start_date) }} at {{ formatEventTime(event.start_date) }}</span>
                    </span>
                    <span v-if="event.venue" class="flex items-center gap-1 truncate">
                      <MapPin class="h-3 w-3 flex-shrink-0" />
                      <span class="truncate">{{ event.venue }}</span>
                    </span>
                  </div>
                </div>
                <Badge variant="secondary" class="flex-shrink-0 text-[10px] sm:text-xs">
                  {{ event.category }}
                </Badge>
              </div>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="!loading && savedEvents.length === 0"
          class="text-center py-8 text-muted-foreground"
        >
          <Calendar class="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p class="text-sm">No saved events yet</p>
          <p class="text-xs mt-1">Save events to see them here</p>
        </div>
      </div>
  </div>
</template>
