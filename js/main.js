// Global error handler to log any uncaught errors for easier debugging.
window.addEventListener('error', (event) => {
  console.error('Caught error:', event.message, event.error);
});

// Wait for the window to load then wait for the A-Frame scene to fully initialize,
// ensuring all AR.js components are ready.
window.addEventListener('load', () => {
  const scene = document.querySelector('a-scene');
  if (!scene) {
    console.error('A-Frame scene not found.');
    return;
  }
  scene.addEventListener('loaded', () => {
    try {
      // Base GPS coordinate (e.g., San Francisco)
      const baseLat = 37.7749;
      const baseLon = -122.4194;
      const numObjects = 10;
      const arObjects = [];

      // Arrays of shapes and colors to vary our AR objects
      const shapes = ['a-box', 'a-sphere', 'a-cone', 'a-cylinder'];
      const colors = ['#EF2D5E', '#FFC65D', '#7BC8A4', '#4CC3D9', '#FF8000'];

      // Generate and spawn 10 test AR objects around the base location.
      // They are arranged in a circle for predictable placement.
      for (let i = 0; i < numObjects; i++) {
        // Angle for object placement
        let angle = (i / numObjects) * 2 * Math.PI;
        // Use a small radius in degrees (~0.0002° ≈ 22m diameter circle)
        let deltaLat = 0.0002 * Math.cos(angle);
        let deltaLon = 0.0002 * Math.sin(angle);
        let lat = baseLat + deltaLat;
        let lon = baseLon + deltaLon;

        // Choose shape and color based on index
        const shapeTag = shapes[i % shapes.length];
        const el = document.createElement(shapeTag);
        const objId = 'object' + (i + 1);
        el.setAttribute('id', objId);
        // Use AR.js's gps-entity-place component for positioning.
        el.setAttribute('gps-entity-place', `latitude: ${lat}; longitude: ${lon};`);

        // Set attributes based on the type of object
        if (shapeTag === 'a-box') {
          el.setAttribute('depth', '2');
          el.setAttribute('height', '2');
          el.setAttribute('width', '2');
        } else if (shapeTag === 'a-sphere') {
          el.setAttribute('radius', '1.5');
        } else if (shapeTag === 'a-cone') {
          el.setAttribute('radius-bottom', '1.5');
          el.setAttribute('radius-top', '0');
          el.setAttribute('height', '3');
        } else if (shapeTag === 'a-cylinder') {
          el.setAttribute('radius', '1');
          el.setAttribute('height', '2');
        }
        // Apply a material color
        el.setAttribute('material', `color: ${colors[i % colors.length]};`);
        // Add a rotation animation for visual interest
        el.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 4000');
        scene.appendChild(el);

        // Store the object's details for use in the mini map
        arObjects.push({ id: objId, index: i + 1, latitude: lat, longitude: lon });
      }

      // Scaling factor to convert degree differences to SVG pixels.
      // For small differences, 1 degree ~ 111km. Here, a scale factor of 100000
      // roughly turns a 0.0001 degree difference (~11.1m) into 10 pixels.
      const scaleFactor = 100000;

      // Setup mini map markers corresponding to each AR object.
      function setupMinimapMarkers() {
        const markersGroup = document.getElementById('minimap-markers');
        arObjects.forEach((obj, index) => {
          const marker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          marker.setAttribute("id", "marker" + obj.index);
          marker.setAttribute("cx", "50"); // Default positions; will be updated by geolocation.
          marker.setAttribute("cy", "50");
          marker.setAttribute("r", "4");
          marker.setAttribute("fill", colors[index % colors.length]);
          markersGroup.appendChild(marker);
        });
      }

      // Update mini map markers based on the user's current location.
      // The user marker remains fixed at the center (100, 100) of the SVG.
      function updateMinimap(userLat, userLon) {
        arObjects.forEach(obj => {
          // Calculate difference from the user's location.
          // The longitude difference maps to the x-axis, and 
          // the latitude difference (inverted) maps to the y-axis.
          const dx = (obj.longitude - userLon) * scaleFactor;
          const dy = (obj.latitude - userLat) * -scaleFactor;
          const cx = 100 + dx;
          const cy = 100 + dy;
          const marker = document.getElementById("marker" + obj.index);
          if (marker) {
            marker.setAttribute("cx", cx);
            marker.setAttribute("cy", cy);
          }
        });
      }

      // Initialize the mini map markers.
      setupMinimapMarkers();

      // Watch the user's geolocation and update the mini map accordingly.
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
    } catch (err) {
      console.error('Error during initialization:', err);
    }
  });
});