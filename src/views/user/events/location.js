import { ref } from 'vue'

export const userLocation = ref(null)

// renamed function
export async function fetchUserLocation() {
  try {
    const position = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    )
    const pos = { lat: position.coords.latitude, lng: position.coords.longitude }
    userLocation.value = pos
    return pos
  } catch (error) {
    console.error('Could not get location:', error)
    return null
  }
}
