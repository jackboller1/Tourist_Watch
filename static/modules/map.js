/* OSM & OL example code provided by https://mediarealm.com.au/ */
var map;
var mapLat = 42.2328;
var mapLng = -88.0457;
var mapDefaultZoom = 10;
var layers = []

const ZOOM_SCALE = 700;

const MARKER_TYPES = [
  {
    "url": "https://upload.wikimedia.org/wikipedia/commons/0/02/Red_Circle%28small%29.svg",
    "scale": [0.4, 0.4]
  },
  {
    "url": "https://upload.wikimedia.org/wikipedia/en/f/fb/Yellow_icon.svg",
    "scale" : [0.06, 0.06]
  }
]

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

export function reset_center(lat, lng, zoom_factor){
  console.log(zoom_factor);
  //console.log("resetting center... " + lat + " " + lng);
  for(let i = 0; i < layers.length; i++){
    map.removeLayer(layers[i]);
  }
  layers.length = 0;
  map.getView().animate(
    {
      center: ol.proj.fromLonLat([lng, lat]),
      duration: 1000
    },
    {
     zoom: zoom_factor * ZOOM_SCALE,
     duration: 1000 
    }
  )
}

export function add_map_point(lat, lng, marker_type) {
  let img = new ol.style.Icon({
    anchor: [0.5, 0.5],
    anchorXUnits: "fraction",
    anchorYUnits: "fraction",
    src: MARKER_TYPES[marker_type]["url"],
  });
  //console.log(img.getScale());
  img.setScale(MARKER_TYPES[marker_type]["scale"][0], MARKER_TYPES[marker_type]["scale"][1]);
  //console.log("after " + img.getScale()); 
  var vectorLayer = new ol.layer.Vector({
    source:new ol.source.Vector({
      features: [new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.transform([parseFloat(lng), parseFloat(lat)], 'EPSG:4326', 'EPSG:3857')),
        })]
    }),
    style: new ol.style.Style({
      image: img
    })
  });
  map.addLayer(vectorLayer); 
  layers.push(vectorLayer);
}
