// pk.eyJ1Ijoibm9vcmFsaSIsImEiOiJjbHd5aXJtd2gxZTJwMmtxejJucXUweTJhIn0
//   .Y49Wde5ofqHR0iVfoJji9w;

mapboxgl.accessToken =
  "sk.eyJ1Ijoibm9vcmFsaSIsImEiOiJjbHd5a2VzOWExdDlzMmpxemFta2luOHRsIn0.m4dDI1YgiGgxvEpmXW-dRw";

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v9",
  zoom: 5,
  center: [30, 15],
});
