$(function(){
  mapboxgl.accessToken = 'pk.eyJ1IjoiaW1uaWNvc3VhcmV6IiwiYSI6ImNpbWtzcXJ6MDAxNXd1cWt1Y2s4bjhlbWsifQ.sJHlwuteFm58lmBRkboFLg';
  var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/imnicosuarez/cimksxx8h00bcg4ns8s2k9svz',
      zoom: 15.83,
      center: [-56.200090, -34.893585],
      pitch: 30.00,
      scrollZoom: false,
      dragPan: false
  });

  var marker = new mapboxgl.Marker()
  .setLngLat([-56.200090, -34.893585])
  .addTo(map);

});