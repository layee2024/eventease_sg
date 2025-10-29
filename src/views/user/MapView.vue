<script setup>
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import { supabase } from "@/utils/supabase"
import { format, parseISO } from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { userLocation } from './events/location.js'

let map
let infowindow
let directionsService
let directionsRenderer

const center = { lat: 1.3051299, lng: 103.8317011 }
const categories = ref([])
const eventCat = ref("All Events")
const markers = ref([])
const allEvents = ref([])
const searchVal = ref("")
const showForm = ref(false)
const popupRef = ref(null)

const destination = ref("")
const travelMode = ref("DRIVING")
const routeDetails = ref(null)
const showSteps = ref(false)

onMounted(async () => {
  await getCurrLoc() 
  console.log('User location fetched in MapView:', userLocation.value)
})

navigator.geolocation.getCurrentPosition((pos) => {
  userLocation.value = {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude
  }
})

// Load Google Maps API
function loadGoogleMapsAPI(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google)
      return
    }

    const existingScript = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`)
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google))
      existingScript.addEventListener('error', () => reject(new Error('Google Maps API failed to load')))
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=beta`
    script.async = true
    script.defer = true
    script.onload = () => resolve(window.google)
    script.onerror = () => reject(new Error('Google Maps API failed to load'))
    document.head.appendChild(script)
  })
}

const joinedIds = ref([])

async function loadJoinedEvents() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data, error } = await supabase
    .from("user_preferences")
    .select("going")
    .eq("id", user.id)
    .single()

  if (error) {
    console.error("Error fetching joined events:", error)
    return
  }
  joinedIds.value = data?.going || []
}


// Initialize map
async function initMap() {
  const apiKey = import.meta.env.VITE_Google_map_API_key

  try {
    await loadGoogleMapsAPI(apiKey)
    const { Map } = await google.maps.importLibrary('maps')
    const { AdvancedMarkerElement } = await google.maps.importLibrary('marker')

    infowindow = new google.maps.InfoWindow()
    directionsService = new google.maps.DirectionsService()
    directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#4F46E5',
        strokeWeight: 7,
        clickable: true,
      }
    })

    map = new Map(document.getElementById("map"), {
      center,
      zoom: 14,
      mapId: '6e19782457baaaf583dee02a',
    })

    directionsRenderer.setMap(map)

    const data = await getCat()
    allEvents.value = data
    for (let event of data) makeMarker(event, map)

    map.addListener("click", () => infowindow.close())
    document.addEventListener("click", handleGlobalClick)
    document.addEventListener("keydown", handleEscapeKey)
  } catch (error) {
    console.error('Google Maps failed:', error)
  }
}

// get all categories
async function getCat() {
  const today = new Date().toISOString()
  const { data, error } = await supabase.from("events").select("*").gte("end_date", today) 
  if (error) {
    console.error("Error fetching events:", error)
    return []
  }
  categories.value = ['All Events', ...new Set(data.map(event => event.category).filter(Boolean))]
  return data
}

async function makeMarker(event, map) {
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary('marker')
  const lat = parseFloat(event.latitude)
  const lng = parseFloat(event.longitude)
  if (!lat || !lng) return

  // Green if going, blue otherwise
  const isJoined = joinedIds.value.includes(event.id)
  const pin = new PinElement({
    background: isJoined ? "#16A34A" : "#EA4335",
    borderColor: "#FFFFFF",
    glyphColor: "#FFFFFF"
  })

  const marker = new AdvancedMarkerElement({
    map,
    position: { lat, lng },
    title: event.title,
    content: pin.element,
    gmpClickable: true
  })

  marker.addEventListener('click', () => {
    infowindow.setContent(createEventPopupContent(event))
    infowindow.setPosition(marker.position)
    infowindow.open(map)

    setTimeout(() => {
      const btn = document.getElementById('getDirectionsBtn')
      if (btn) {
        btn.addEventListener('click', async () => {
          const lat = parseFloat(btn.dataset.lat)
          const lng = parseFloat(btn.dataset.lng)
          if (userLocation.value) {
            await showRouteToDestination({ lat, lng })
          } else {
            alert("Please allow location access first.")
          }
        })
      }
    }, 300)
  })

  markers.value.push(marker)
}

function createEventPopupContent(event) {
  const { date: startDate } = convertTimeDate(event.start_date)
  const { date: endDate } = convertTimeDate(event.end_date)
  return `
    <div style="max-width: 250px">
      <img class="w-full mb-2 rounded" src='${event.image_url}' />
      <h3 style="font-weight:bold; margin-bottom: 4px;"><u>${event.title}</u></h3>
      <p><strong>Location:</strong> ${event.venue}</p>
      <p><strong>Date:</strong> ${startDate || "TBC"} - ${endDate || "TBC"}</p>
      <p>${event.description || "No description available."}</p>
      <button 
        id="getDirectionsBtn"
        data-lat="${event.latitude}" 
        data-lng="${event.longitude}"
        class="bg-indigo-600 text-white px-3 py-2 mt-3 rounded w-full hover:bg-indigo-500 transition cursor-pointer"
      >
        Get Directions
      </button>
    </div>
  `
}

function convertTimeDate(timeDate) {
  if (!timeDate) return { date: null, time: null }
  const dateObj = parseISO(timeDate)
  return {
    date: format(dateObj, 'MMM d, yyyy'),
    time: format(dateObj, 'h:mm a')
  }
}

function clearMarkers() {
  markers.value.forEach(marker => marker.map = null)
  markers.value = []
}

function getEventMarkerByCat(cat, list) {
  return cat === 'All Events' ? list : list.filter(e => e.category === cat)
}

function filterBySearch() {
  const search = searchVal.value.trim().toLowerCase()
  let filtered = getEventMarkerByCat(eventCat.value, allEvents.value)
  if (search) {
    filtered = filtered.filter(event =>
      event.title?.toLowerCase().includes(search) ||
      event.description?.toLowerCase().includes(search)
    )
  }
  clearMarkers()
  filtered.forEach(event => makeMarker(event, map))
}

function handleGlobalClick(event) {
  const mapEl = document.getElementById('map')
  const infoWindowEl = document.querySelector('.gm-style-iw')
  if (mapEl?.contains(event.target) || infoWindowEl?.contains(event.target) || popupRef.value?.contains(event.target))
    return
}

function handleEscapeKey(event) {
  if (event.key === 'Escape') {
    showForm.value = false
    infowindow?.close()
  }
}

// current location marker
async function getCurrLoc() {
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary('marker')
  try {
    const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject))
    const pos = { lat: position.coords.latitude, lng: position.coords.longitude }
    userLocation.value = pos
    const pin = new PinElement({ glyph: "👤", background: "white", borderColor: "black" })
    new AdvancedMarkerElement({ map, position: pos, content: pin.element, gmpClickable: false, zIndex: 9999 })
    map.setCenter(pos)
  } catch (error) {
    console.error('Could not get location:', error)
  }
}

// directions logic
async function showRouteToDestination(destCoords) {
  try {
    const request = {
      origin: userLocation.value,
      destination: destCoords,
      travelMode: travelMode.value,
    }

    directionsService.route(request, (result, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(result)
        const leg = result.routes[0].legs[0]
        routeDetails.value = leg
        showSteps.value = false

        google.maps.event.clearListeners(directionsRenderer, "click")
        google.maps.event.addListener(directionsRenderer, "click", () => {
          showSteps.value = !showSteps.value
        })
      } else {
        console.warn("Directions request failed:", status)
        alert("Could not fetch route for this mode.")
      }
    })
  } catch (error) {
    console.error("Directions error:", error)
  }
}

async function changeTravelMode(mode) {
  travelMode.value = mode
  if (!routeDetails.value) return
  const destCoords = {
    lat: routeDetails.value.end_location.lat(),
    lng: routeDetails.value.end_location.lng()
  }
  await showRouteToDestination(destCoords)
}

onMounted(async () => {
  document.body.style.overflow = 'hidden'
  await loadJoinedEvents()
  await initMap()
  getCurrLoc()
})

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('click', handleGlobalClick)
  document.removeEventListener('keydown', handleEscapeKey)
})

watch([searchVal, eventCat], filterBySearch)
</script>

<template>
  <section>
    <div id="map-container" class="relative w-full h-[93vh]">
      <div id="map" class="inset-0 z-0 pt-2 h-[92vh] w-screen"></div>
      <div
        id="searchcontainer"
        class="fixed z-40 top-[100px] sm:top-[80px] left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-6 flex flex-col sm:flex-row sm:space-x-5 space-y-4 sm:space-y-0"
      >
        <input v-model="searchVal" placeholder="Search" class="input" />
        <select v-model="eventCat" class="select cursor-pointer">
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <!-- Route Summary Card -->
      <transition name="fade" mode="out-in">
      <div
        v-if="routeDetails"
        class="fixed bottom-5 right-5 bg-white shadow-xl rounded-2xl border border-gray-200 w-[350px] overflow-hidden transition-all duration-300"
      >
        <Card class="pt-0">
          <CardHeader class="py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex justify-between items-center">
            <CardTitle class="text-lg font-semibold flex items-center gap-2">
              Route Summary
            </CardTitle>
            <button
              @click="routeDetails = null"
              class="text-white hover:text-gray-200 text-xl font-bold transition cursor-pointer"
              title="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </CardHeader>

          <!-- Travel Mode Buttons -->
          <div class="flex justify-around items-center">
            <button
              v-for="mode in ['DRIVING','TRANSIT','BICYCLING','WALKING']"
              :key="mode"
              @click="changeTravelMode(mode)"
              class="cursor-pointer"
              :class="[
                'px-3 py-1.5 rounded-md text-sm font-medium transition',
                travelMode === mode ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              ]"
            >
              {{ mode === 'DRIVING' ? 'Car' :
                 mode === 'TRANSIT' ? 'Bus/MRT' :
                 mode === 'BICYCLING' ? 'Bicycle' : 'Walk' }}
            </button>
          </div>

          <CardContent class="pb-2 text-sm text-gray-700 space-y-2">
            <div>
              <p><span class="font-semibold">From:</span> {{ routeDetails.start_address }}</p>
              <p><span class="font-semibold">To:</span> {{ routeDetails.end_address }}</p>
            </div>
            <div class="flex justify-between text-indigo-600 font-semibold mt-3">
              <span>Distance: {{ routeDetails.distance.text }}</span>
              <span>Duration: {{ routeDetails.duration.text }}</span>
            </div>
          </CardContent>
        </Card>

        <!-- Steps List -->
        <Card v-if="showSteps" class="mt-2 border-indigo-200">
          <CardHeader>
            <CardTitle class="text-gray-800 text-base">Step-by-Step Directions</CardTitle>
          </CardHeader>
          <CardContent class="max-h-[200px] overflow-y-auto text-sm text-gray-600 space-y-2">
            <ul class="list-disc pl-5">
              <li v-for="(step, i) in routeDetails.steps" :key="i" v-html="step.instructions"></li>
            </ul>
          </CardContent>
        </Card>
      </div>
      </transition>
    </div>
    <!-- Map Legend -->
<div
  id="map-legend"
  class="fixed bottom-6 left-6 bg-white border border-gray-300 shadow-md rounded-lg px-4 py-3 text-sm text-gray-700 space-y-3 z-40"
>
  <div class="font-semibold text-gray-800 mb-1">Legend</div>

  <!-- Joined Events -->
  <div class="flex items-center gap-2">
    <div class="w-4 h-5">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full text-[#16A34A]">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    </div>
    <span>Joined Events</span>
  </div>

  <!-- Available Events -->
  <div class="flex items-center gap-2">
    <div class="w-4 h-5">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full text-[#EA4335]">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    </div>
    <span>Available Events</span>
  </div>

  <!-- Your Current Location -->
  <div class="flex items-center gap-2">
    <div class="w-4 h-5">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    </div>
    <span>Your Location</span>
  </div>

  <!-- Route Line -->
  <div class="flex items-center gap-2">
    <div class="w-4 h-[3px] bg-indigo-500 rounded"></div>
    <span>Route Path</span>
  </div>
</div>


  </section>
</template>

<style scoped>
.input {
  min-width: 0;
  flex: 1;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 0.375rem;
  padding: 0.5rem 0.875rem;
  border: 1px solid #d1d5db;
}
.select {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
