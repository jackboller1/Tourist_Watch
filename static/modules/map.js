/* OSM & OL example code provided by https://mediarealm.com.au/ */
var map;
var mapLat = 42.2328;
var mapLng = -88.0457;
var mapDefaultZoom = 10;
var layers = []

export function initialize_map() {
  map = new ol.Map({
    target: "map",
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM({
                  url: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
            })
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([mapLng, mapLat]),
        zoom: mapDefaultZoom
    })
  });
}

export function reset_center(lat, lng){
  //console.log("resetting center... " + lat + " " + lng);
  for(let i = 0; i < layers.length; i++){
    map.removeLayer(layers[i]);
  }
  layers.length = 0;
  map.getView().animate({
    center: ol.proj.fromLonLat([lng, lat]),
    duration: 1000
 })
}

export function add_map_point(lat, lng) {
  var vectorLayer = new ol.layer.Vector({
    source:new ol.source.Vector({
      features: [new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.transform([parseFloat(lng), parseFloat(lat)], 'EPSG:4326', 'EPSG:3857')),
        })]
    }),
    style: new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 0.5],
        anchorXUnits: "fraction",
        anchorYUnits: "fraction",
        src: "https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg"
      })
    })
  });
  map.addLayer(vectorLayer); 
  layers.push(vectorLayer);
}
