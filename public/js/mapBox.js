mapboxgl.accessToken =
  "pk.eyJ1Ijoibm9vcmFsaSIsImEiOiJjbHg2NmtwbmExb2ZzMnJxdTlwdGFlZDIxIn0.ClYvcAME7HJK-HEGIk7enQ";

const locs = JSON.parse(
  document.querySelector(".section-map").dataset.locations
);

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/noorali/clx66rfdm002o01pjeqz8c4in",
  // projection: "globe",
  // interactive: false,
  // zoom: 5,
  // center: [-80.128473, 25.781842],
  // scrollZoom: false,
});

// map.scrollZoom.disable();

const bounds = new mapboxgl.LngLatBounds();

locs.forEach((loc) => {
  // Create Marker
  const el = document.createElement("div");
  el.className = "marker";

  // Add Marker
  new mapboxgl.Marker({ element: el, anchor: "bottom" })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add a Popup
  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description} </p>`)
    .addTo(map);

  console.log(loc.coordinates);

  // Extend map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
