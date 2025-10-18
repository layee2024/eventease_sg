<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { supabase } from "@/utils/supabase"
import { format, parseISO } from 'date-fns'

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
        strokeWeight: 8
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

    for (let event of data) {
      makeMarker(event, map)
    }

    map.addListener("click", () => {
      infowindow.close()
    })

    document.addEventListener("click", handleGlobalClick)
    document.addEventListener("keydown", handleEscapeKey)

  } catch (error) {
    console.error('Google Maps failed:', error)
  }
}

// get all categories of events
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
  })

  markers.value.push(marker)
}

// popup window for each marker
function createEventPopupContent(event) {
  const { date: startDate, time: startTime } = convertTimeDate(event.start_date)
  const { date: endDate, time: endTime } = convertTimeDate(event.end_date)

  return `
    <div style="max-width: 250px">
      <img class="w-full mb-2" src='${event.image_url}' />
      <h3 style="font-weight:bold; margin-bottom: 4px;"><u>${event.title}</u></h3>
      <p><strong>Location:</strong> ${event.venue}</p>
      <p><strong>Date:</strong> ${startDate || "TBC"} - ${endDate || "TBC"}</p>
      <p><strong>Time:</strong> ${startTime || "TBC"} - ${endTime || "TBC"}</p>
      <p>${event.description || "No description available."}</p>
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

// filtering markers based of category selected
function getEventMarkerByCat(cat, list) {
  return cat === 'All Events' ? list : list.filter(e => e.category === cat)
}

function clearMarkers() {
  markers.value.forEach(marker => marker.map = null)
  markers.value = []
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

// close infowindow if clicked outside of itself
function handleGlobalClick(event) {
  const mapEl = document.getElementById('map')
  const infoWindowEl = document.querySelector('.gm-style-iw')

  if (
    mapEl?.contains(event.target) ||
    infoWindowEl?.contains(event.target) ||
    popupRef.value?.contains(event.target)
  ) return
}

function handleEscapeKey(event) {
  if (event.key === 'Escape') {
    showForm.value = false
    infowindow?.close()
  }
}

// Get user's current location
async function getCurrLoc() {
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary('marker')

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject)
    })

    const pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    }

    userLocation.value = pos

    const pin = new PinElement({
      glyph: "😃",
      background: "white",
      borderColor: "black"
    })

    const marker = new AdvancedMarkerElement({
      map,
      position: pos,
      content: pin.element,
      gmpClickable: false,
      zIndex: 9999
    })

    map.setCenter(pos)
  } catch (error) {
    console.error('Could not get location:', error)
  }
}

// get the address from the forms and create route to the destination
async function handleDirectionSubmit() {
  if (!destination.value.trim()) {
    alert('Please enter a destination')
    return
  }

  if (!userLocation.value) {
    alert('Please allow location access first')
    return
  }

  try {
    const request = {
      origin: userLocation.value,
      destination: destination.value,
      travelMode: google.maps.TravelMode[travelMode.value]
    }

    directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result)
        showForm.value = false
        infowindow.close()
      } else {
        alert(`Directions request failed: ${status}`)
      }
    })
  } catch (error) {
    console.error('Directions error:', error)
    alert('Failed to get directions. Please try again.')
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

// filter by search based off changes in these two filters
watch([searchVal, eventCat], filterBySearch)
</script>

<template>
  <section>
    <div class="relative w-full h-screen" id="map-container">
      <div id="map" class="inset-0 z-0" style="height: 95vh; width: 100vw;"></div>

      <div
        id="searchcontainer"
        class="fixed z-40 top-[100px] sm:top-[80px] left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-6 flex flex-col sm:flex-row sm:space-x-5 space-y-4 sm:space-y-0"
      >
        <input
          v-model="searchVal"
          placeholder="🔍 Search"
          class="min-w-0 flex-auto shadow-sm rounded-md bg-white px-3.5 py-2 text-gray-900 outline-1 outline-offset-[-1px] outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
        />

        <select
          v-model="eventCat"
          class="px-3.5 py-2.5 border border-gray-300 rounded-md text-sm font-normal text-gray-700 shadow-sm focus:outline-indigo-600"
        >
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>

        <button
          type="button"
          class="bg-indigo-600 text-white px-4.5 py-2.5 shadow-sm rounded-md text-sm font-semibold hover:bg-indigo-500 focus:outline-indigo-600 h-10"
          @click="showForm = true"
        >
          Directions
        </button>
      </div>
    </div>

    <div
      v-if="showForm"
      ref="popupRef"
      style="position: fixed; top: 9rem; right: 7rem; transform: translateX(-50%); z-index: 9999;"
      class="z-50 bg-white p-5 rounded-lg shadow-2xl border-2 border-indigo-600 w-[300px]"
    >
      <h2 class="text-lg font-bold mb-4">Get Directions</h2>
      <form @submit.prevent="handleDirectionSubmit" class="space-y-4">
        <label class="block">
          Destination:
          <input
            v-model="destination"
            type="text"
            required
            placeholder="Enter address or place"
            class="mt-1 border border-black p-2 w-full rounded-md bg-white"
          />
        </label>

        <label class="block">
          Travel Mode:
          <select
            v-model="travelMode"
            class="mt-1 border border-black p-2 w-full rounded-md bg-white"
          >
            <option value="DRIVING">Driving</option>
            <option value="WALKING">Walking</option>
            <option value="BICYCLING">Bicycling</option>
            <option value="TRANSIT">Transit</option>
          </select>
        </label>

        <div class="flex justify-end space-x-2">
          <button type="button" @click="showForm = false" class="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500">Get Directions</button>
        </div>
      </form>
    </div>

  </section>
</template>

<style scoped>
#map-container {
  position: relative;
  width: 100%;
  height: 100vh;
  max-height: 100vh;
}

#map {
  height: 100%;
  width: 100%;
}
</style>