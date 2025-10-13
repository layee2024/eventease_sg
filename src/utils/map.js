export async function displayGoogleMap(apiKey){
    return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    window.initMap = function () {
      resolve(window.google.maps);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=marker`;
    script.async = true;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}