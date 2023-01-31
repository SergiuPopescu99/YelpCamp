

mapboxgl.accessToken = mapToken
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: campg.geometry.coordinates,
    zoom: 10
});
const popup = new mapboxgl.Popup({ offset: 25 }).setText(
    campg.title
);
map.addControl(new mapboxgl.NavigationControl());
new mapboxgl.Marker()
    .setLngLat(campg.geometry.coordinates)
    .setPopup(popup)
    .addTo(map)
