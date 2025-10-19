<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { supabase } from "@/utils/supabase"
import { format, parseISO } from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

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
const userLocation = ref(null)
const routeDetails = ref(null)
const showSteps = ref(false)

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
  const { data, error } = await supabase.from("events").select("*")
  if (error) {
    console.error("Error fetching events:", error)
    return []
  }

  categories.value = ['All Events', ...new Set(data.map(event => event.category).filter(Boolean))]
  return data
}

async function makeMarker(event, map) {
  const { AdvancedMarkerElement } = await google.maps.importLibrary('marker')
  const lat = parseFloat(event.latitude)
  const lng = parseFloat(event.longitude)
  if (!lat || !lng) return

  const marker = new AdvancedMarkerElement({
    map,
    position: { lat, lng },
    title: event.title,
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
        class="bg-indigo-600 text-white px-3 py-2 mt-3 rounded w-full hover:bg-indigo-500 transition"
      >
        🚗 Get Directions
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
    const pin = new PinElement({ glyph: "📍", background: "white", borderColor: "black" })
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
      travelMode: google.maps.TravelMode.DRIVING,
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
      }
    })
  } catch (error) {
    console.error("Directions error:", error)
  }
}

onMounted(async () => {
  document.body.style.overflow = 'hidden'
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
    <div id="map-container" class="relative w-full h-screen">
      <div id="map" class="inset-0 z-0 h-[95vh] w-screen"></div>

      <div
        id="searchcontainer"
        class="fixed z-40 top-[100px] sm:top-[80px] left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-6 flex flex-col sm:flex-row sm:space-x-5 space-y-4 sm:space-y-0"
      >
        <input v-model="searchVal" placeholder="🔍 Search" class="input" />
        <select v-model="eventCat" class="select">
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <button class="btn" @click="showForm = true">Directions</button>
      </div>

      <!-- Route Summary Card -->
      <div
        v-if="routeDetails"
        class="fixed bottom-5 right-5 bg-white shadow-xl rounded-2xl border border-gray-200 w-[350px] overflow-hidden"
      >
        <Card class="pt-0">
          <CardHeader class="pt-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <CardTitle class="text-lg font-semibold flex items-center gap-2">
              Route Summary
            </CardTitle>
          </CardHeader>
          <CardContent class="p-4 text-sm text-gray-700 space-y-2">
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

        <!-- Steps List (only visible when line is clicked) -->
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
.btn {
  background-color: #4f46e5;
  color: white;
  padding: 0.625rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 600;
  transition: background 0.2s;
}
.btn:hover {
  background-color: #4338ca;
}
</style>
