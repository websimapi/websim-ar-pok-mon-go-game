// List of AR object markers with their fixed GPS coordinates.
// These should match the coordinates used in the A-Frame entities.
const arObjects = [
  { id: 'marker1', latitude: 37.7749, longitude: -122.4194 },
  { id: 'marker2', latitude: 37.7750, longitude: -122.4190 },
  { id: 'marker3', latitude: 37.7751, longitude: -122.4185 },
];

// Scaling factor to convert degree differences to SVG pixels.
// For small differences, 1 degree ~ 111km. Here, a scale factor of 100000
// roughly turns a 0.0001 degree difference (~11.1m) into 10 pixels.
const scaleFactor = 100000;

/**
 * Update the mini map positions based on the user's current location.
 * The user's marker remains at the center (100, 100) of the SVG.
 */
function updateMinimap(userLat, userLon) {
  arObjects.forEach(obj => {
    // Calculate difference from the user's location.
    // The longitude difference maps to the x-axis, and latitude difference (inverted)
    // maps to the y-axis (since in SVG, y increases downward).
    const dx = (obj.longitude - userLon) * scaleFactor;
    const dy = (obj.latitude - userLat) * -scaleFactor;
    const cx = 100 + dx;
    const cy = 100 + dy;
    const marker = document.getElementById(obj.id);
    if (marker) {
      marker.setAttribute('cx', cx);
      marker.setAttribute('cy', cy);
    }
  });
}

// Watch the user's geolocation, and update the mini map accordingly.
if ('geolocation' in navigator) {
  navigator.geolocation.watchPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;
      updateMinimap(userLat, userLon);
    },
    (error) => {
      console.error('Error getting geolocation: ', error);
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 27000 }
  );
} else {
  console.error('Geolocation is not supported by this browser.');
}