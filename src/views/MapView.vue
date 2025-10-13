<script setup>
// import { onMounted, onUnmounted, ref, watch } from 'vue'
// import { displayGoogleMap } from '../utils/map'


// const eventCat = ref('All Events')
// const map = ref(null)
// const categories = ref([])
// let infoWindow = null
// const markers = ref([])

// const onload = async () => {
//   const apiKey = import.meta.env.VITE_Google_map_API_key
//   try {
//     const { maps, AdvancedMarkerElement } = await displayGoogleMap(apiKey)
//     map.value = new maps.Map(document.getElementById('map'), {
//       center: { lat: 1.3035107, lng: 103.872791653661 },
//       zoom: 15,
//       gestureHandling: 'cooperative',
//       mapId: '6e19782457baaaf583dee02a'
//     })
//   } catch (error) {
//     console.error(error)
//   }
// }

// async function getCat() {
//   markers.value.forEach(({ marker }) => marker?.setMap(null));
//   markers.value = [];

//   const { data, error } = await supabase.from("events").select("*");
//   if (error) {
//     console.error("Error fetching events:", error);
//     return;
//   }

//   categories.value = ['All Events', ...new Set(data.map(event => event.category).filter(Boolean))];

//   for (let event of data) {
//     const marker = await markEvent(event);
//     if (marker) {
//       markers.value.push({ marker, category: event.category, event });
//     }
//   }

//   filterMarkersByCategory();
// }

// function filterMarkersByCategory() {
//   markers.value.forEach(({ marker, category }) => {
//     if (!marker) return;
//     const visible = eventCat.value === "All Events" || eventCat.value === category;
//     visible ? marker.setMap(map.value) : marker.setMap(null);
//   });
// }

// async function markEvent(event) {
//   const { latitude: lat, longitude: long, title, description, image_url, start_date, end_date, venue } = event;

//   if (!lat || !long) {
//     console.warn(`Event ${title} missing coordinates, skipping marker.`);
//     return null;
//   }

//   if (!google.maps.marker || !google.maps.marker.AdvancedMarkerView) {
//     console.error('AdvancedMarkerView is not available yet');
//     return null;
//   }

//   const contentDiv = document.createElement('div');
//   contentDiv.style.backgroundColor = 'white';
//   contentDiv.style.border = '1px solid #ccc';
//   contentDiv.style.borderRadius = '8px';
//   contentDiv.style.padding = '4px 8px';
//   contentDiv.style.fontWeight = 'bold';
//   contentDiv.style.fontSize = '14px';
//   contentDiv.style.cursor = 'pointer';
//   contentDiv.style.whiteSpace = 'nowrap';
//   contentDiv.textContent = title;

//   const marker = new google.maps.marker.AdvancedMarkerView({
//     map: map.value,
//     position: { lat, lng: long },
//     title,
//     content: contentDiv,
//   });

//   if (!infoWindow) {
//     infoWindow = new google.maps.InfoWindow();
//   }

//   marker.addListener('click', () => {
//     infoWindow.close();

//     const { date: startDate, time: startTime } = convertTimeDate(start_date);
//     const { date: endDate, time: endTime } = convertTimeDate(end_date);

//     infoWindow.setContent(`
//       <div style="min-width: 200px;">
//         <div class="container relative"> 
//           <img src="${image_url}" style="width: 300px; display: block; margin: 0 auto 8px auto; border: 1px solid black; border-radius: 5px" />
//         </div>
//         <h2 style="margin:0 0 8px 0; font-weight: bold; font-size:large">${title}</h2>
//         <p><strong>Venue:</strong> ${venue || 'To Be Confirmed'}</p>
//         <p><strong>Date:</strong> ${startDate || 'Not available'} - ${endDate || 'Not available'}</p>
//         <p><strong>Time:</strong> ${startTime || 'Not available'} - ${endTime || 'Not available'}</p>
//         <p><strong>Description:</strong> ${description || 'No description available.'}</p>
//       </div>
//     `);

//     infoWindow.open({ anchor: marker, map: map.value, shouldFocus: false });
//   });

//   return marker;
// }

// function convertTimeDate(timeDate) {
//   if (!timeDate) return { date: null, time: null };
//   const dateObj = parseISO(timeDate);
//   return {
//     date: format(dateObj, 'MMM d, yyyy'),
//     time: format(dateObj, 'h:mm a')
//   }
// }

// onMounted(async () => {
//   document.body.style.overflow = 'hidden';
//   await onload();
//   await getCat();
// });

// watch(eventCat, () => {
//   filterMarkersByCategory();
// }, { immediate: true });

// onUnmounted(() => {
//   document.body.style.overflow = '';
// });

import { onMounted, ref, watch } from 'vue';
import { supabase } from "@/utils/supabase";
import { format, parseISO } from 'date-fns'

let map;
const center = { lat: 1.3051299, lng: 103.8317011 };
const categories = ref([]);
const eventCat = ref("All Events");
const markers = ref([]);
const allEvents = ref([]);
let infowindow;

function loadGoogleMapsAPI(apiKey) {
  return new Promise((resolve, reject) => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      resolve(window.google);
      return;
    }

    // Check if script already exists (avoid adding duplicate)
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`);
    if (existingScript) {
      // If script exists but not loaded yet, listen for load event
      existingScript.addEventListener('load', () => resolve(window.google));
      existingScript.addEventListener('error', () => reject(new Error('Google Maps API failed to load')));
      return;
    }

    // Create script tag with async and defer
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=beta`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Google Maps API failed to load'));

    document.head.appendChild(script);
  });
}

async function initMap() {
  const apiKey = import.meta.env.VITE_Google_map_API_key;
  try {
    await loadGoogleMapsAPI(apiKey);

    // Now load the libraries via importLibrary (async import)
    const { Map } = await google.maps.importLibrary('maps');
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary('marker');
    infowindow = new google.maps.InfoWindow();

    map = new Map(document.getElementById("map"), {
      center,
      zoom: 14,
      mapId: '6e19782457baaaf583dee02a',
    });


    let dataObjList = await getCat();
    allEvents.value = dataObjList;
    // console.log(dataObjList);

    for (let event of dataObjList){
      makeMarker(event, map)
    }

   
    
  } catch (error) {
    console.error('Google Maps failed:', error);
  }
}

// getting the unique categories of events in db
async function getCat(){
  const { data, error } = await supabase.from("events").select("*");

  if (error) {
    console.error("Error fetching events:", error);
    return;
  }

  categories.value = ['All Events', ...new Set(data.map(event => event.category).filter(Boolean))];

  return data
}

// make marker for each event
async function makeMarker(event, map) {
  const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');

  let lat = parseFloat(event.latitude);
  let lng = parseFloat(event.longitude);

  if (!lat || !lng) {
    console.warn(`Skipping marker for event ${event.title} due to invalid coords`);
    return;
  }

  const marker = new AdvancedMarkerElement({
    map: map,
    position: { lat, lng },
    title: event.title,
    gmpClickable: true
  })

  marker.addEventListener('click', (e) =>{
    infowindow.close()
    infowindow.setContent(createEventPopupContent(event))
    infowindow.setPosition(marker.position);
    infowindow.open({
    map: map,
    anchor: null,
    shouldFocus: false
  });
  });

  markers.value.push(marker);
}

// make function that returns the content of the popup window
function createEventPopupContent(event) {
  const { date: startDate, time: startTime } = convertTimeDate(event.start_date);
  const { date: endDate, time: endTime } = convertTimeDate(event.end_date);

  return `
    <div style="max-width: 250px;">
      <img class="flex justify-center w-full py-2 " src='${event.image_url}'>
      <h3 class="font-bold py-1" style="margin: 0; font-size: 18px;"><u>${event.title}</u></h3>
      <p class="py-1" style="margin: 4px 0;"><strong>Date:</strong> ${startDate || "TBC"} - ${endDate || "TBC"}</p>
      <p class="py-1" style="margin: 4px 0;"><strong>Date:</strong> ${startTime || "TBC"} - ${endTime || "TBC"}</p>
      <p class="py-1" style="margin: 4px 0;">${event.description || "No description available."}</p>
    </div>
  `;
}

function convertTimeDate(timeDate) {
  if (!timeDate) return { date: null, time: null };
  const dateObj = parseISO(timeDate);
  return {
    date: format(dateObj, 'MMM d, yyyy'),
    time: format(dateObj, 'h:mm a')
  }
}

// function that filters the events by category
function getEventMarkerByCat(chosenCat, eventObjList){
  if (chosenCat == 'All Events'){
    return eventObjList;
  }

  return eventObjList.filter(event => event.category === chosenCat);
}

// clear old markers
function clearMarkers() {
  markers.value.forEach(marker => marker.map = null);
  markers.value = [];
}


onMounted(async () => {
  document.body.style.overflow = 'hidden';
  await initMap();
});

watch(eventCat, (newCat) => {
  clearMarkers();

   const filteredEvents = getEventMarkerByCat(newCat, allEvents.value);
    filteredEvents.forEach(event => {
      makeMarker(event, map)
    });
})
</script>

<template>
  <section>
    <div class="w-full h-screen relative" id="map-container">
      <div id="map" class="inset-0 z-0" style="height: 95vh; width: 100vw;"></div>

      <form>
        <div
          id="searchcontainer"
          class="z-50 shadow-lg fixed top-[40px] md:top-[80px]  xl:top-[80px] left-1/2 transform -translate-x-1/2 p-6 bg-white border border-gray-300 rounded-lg"
        >
          <input
            id="searchVal"
            type="text"
            name="search"
            placeholder="🔍   Search"
            class="min-w-0 flex-auto rounded-md bg-white px-3.5 py-2 text-gray-900 outline-1 outline-offset-[-1px] outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
          />

          <select
            v-model="eventCat"
            class="mx-5 px-3.5 py-2.5 border border-gray-300 rounded-md text-sm font-normal text-gray-700 shadow-sm focus:outline-indigo-600"
          >
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>

          <button
            type="submit"
            class="bg-indigo-600 px-3.5 py-2.5 rounded-md text-white text-sm font-semibold hover:bg-indigo-500 focus:outline-indigo-600"
            @click.prevent="Direction"
          >
            Directions
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
#map {
  background-color: darkgray;
  /* moved height and width inline for clarity but can stay here too */
}
</style>