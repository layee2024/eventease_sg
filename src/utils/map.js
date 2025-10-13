// export async function displayGoogleMap(apiKey) {
//   return new Promise((resolve, reject) => {
//     if (window.google && window.google.maps) {
//       google.maps.importLibrary("marker")
//         .then(({ AdvancedMarkerElement, PinElement }) => {
//           resolve({ maps: window.google.maps, AdvancedMarkerElement, PinElement });
//         })
//         .catch(reject);
//       return;
//     }

const { Script } = require("vm");

//     window.initMap = async function () {
//       try {
//         const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
//         resolve({ maps: window.google.maps, AdvancedMarkerElement, PinElement });
//       } catch (err) {
//         reject(err);
//       }
//     };

//     const script = document.createElement('script');
//     script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&v=beta&callback=initMap`;
//     script.async = true;
//     script.onerror = reject;
//     document.head.appendChild(script);
//   });
// }

let map;
let center =  { lat: -34.397, lng: 150.644 };

async function initMap() {
  await google.maps.importLibrary("maps");
  await google.maps.importLibrary("marker");

  map = new google.maps.Map(document.getElementById("map"), {
    center,
    zoom: 8,
    mapId: "6e19782457baaaf583dee02a",
  });

  addMarker();
}

async function addMarker() {
  const marker = new google.maps.marker.AdvancedMarkerElement({
    map,
    position: center,
  });
}

initMap();