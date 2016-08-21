$(function(){
    mapboxgl.accessToken = 'pk.eyJ1IjoibW9iaWxlZGF5dXkiLCJhIjoiY2lxNHNhN2QyMDAwYmZsbTZydG4yb2ZzeSJ9.lFAWW3TvMm5EzUOQoNPloQ';

    var isMobileViewport = getBreakpoint(document.querySelector('.variables-metadata')).mobile_viewport;
    var venuePos = [-56.19448037405206, -34.89219928156295];
    var centerPos = isMobileViewport ? venuePos : [-56.201700, -34.892280];

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mobiledayuy/cirmxjudm000lg3nkghetgp16',
        zoom: 15.26,
        center: centerPos,
        pitch: 0.00,
        interactive: false
    });

    map.on('style.load', function () {
        map.addSource("markers", {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-56.19448037405206, -34.89219928156295]
                    }
                }]
            }
        });
        map.addLayer({
            "id": "markers",
            "type": "symbol",
            "source": "markers",
            "layout": {
                "icon-image": "blue-marker",
                "icon-offset": [0, -30]
            }
        });
    });
});
