// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

// Create color of marker based on depth of earthquake.
function chooseColor(depth) {
  switch(true) {
    case depth > 90:
      return '#800026';
    case depth > 70:
      return '#BD0026';
    case depth > 50:
      return '#E31A1C';
    case depth > 30:
      return '#FC4E2A';
    case depth > 10:
      return '#FD8D3C';
    default:
      return '#FFEDA0';
  }
}

// Create features.
function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>" +
      "</h3><hr><p>Depth: " + feature.geometry.coordinates[2] + "</p>"
      );
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function(feature, latlng) {
      let markers = {
        radius: feature.properties.mag * 10000,
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        fillOpacity: 1,
        color: 'black',
        weight: 0.5
      }
      return L.circle(latlng,markers)
    }

  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

// Create Legend. 
let legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
  let div = L.DomUtil.create('div', 'info legend');
  let grades = [0, 10, 30, 50, 70, 90];
  
  // Define a function to calculate color based on depth
  function getColor(depth) {
    return depth > 90 ? '#800026' :
    depth > 70 ? '#BD0026' :
    depth > 50 ? '#E31A1C' :
    depth > 30 ? '#FC4E2A' :
    depth > 10 ? '#FD8D3C' :
    '#FFEDA0';
  }

  // Loop through depth intervals and generate a label with a colored square for each interval
  for (let i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }

  return div;
};

// Create Map.
function createMap(earthquakes) {

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseLayers = {
    "Street Map": street,
    "Topographic Map": topo,
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };
  
  // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [street, earthquakes]
    });

    // Add legend to map.
    legend.addTo(myMap);

    // Create a layer control and add the layer control to the map.
    L.control.layers(baseLayers, overlayMaps, {
    collapsed: false
    }).addTo(myMap);
}