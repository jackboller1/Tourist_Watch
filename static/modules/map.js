import * as util from "./util.js"

var map;
var mapLat = 42.2328;
var mapLng = -88.0457;
var mapDefaultZoom = 10;
var layers = []

var curr_data = null;

const ZOOM_SCALE = 1;

const popup = new ol.Overlay({
  element: document.getElementById('popup'),
});


const MARKER_TYPES = {
  "assault": {
    "url": "https://upload.wikimedia.org/wikipedia/commons/0/02/Red_Circle%28small%29.svg",
    "scale": [0.4, 0.4]
  },
  "petty_theft": {
    "url": "https://upload.wikimedia.org/wikipedia/en/f/fb/Yellow_icon.svg",
    "scale" : [0.06, 0.06]
  },
  "theft": {
    "url": "https://upload.wikimedia.org/wikipedia/commons/9/91/Location_dot_orange.svg",
    "scale" : [0.2, 0.2]
  },
  "neutral": {
    "url": "https://upload.wikimedia.org/wikipedia/commons/2/20/Location_dot_purple.svg",
    "scale" : [0.2, 0.2]
  }
}

export const initialize_map = () => {
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
  map.addOverlay(popup);

  map.on("click", (evt) => {
    const element = popup.getElement();
    const coordinate = evt.coordinate;
    const hdms = ol.coordinate.toStringHDMS(ol.proj.toLonLat(coordinate));
  
    $(element).popover('dispose');
    popup.setPosition(coordinate);
    $(element).popover({
      container: element,
      placement: 'top',
      animation: false,
      html: true,
      content: "<button id='popupButton'>Click me</button>"
    });
    $(element).popover('show');
  });
  
}

const clearLayers = () => {
  for(let i = 0; i < layers.length; i++){
    map.removeLayer(layers[i]);
  }
  layers = []
}


export const populate = (data) => {
  clearLayers();
  curr_data = data;
  
  let all_pts = []
  //all crime points
  for(let i = 0; i < data["crime"].length; i++){
    let lat = data["crime"][i].latitude;
    let long  = data["crime"][i].longitude;
    if(typeof(lat) === "string"){
      lat = parseFloat(lat);
      long = parseFloat(long);
    }
    all_pts.push({
      "lat" : lat,
      "long" : long
    });
    add_map_point(lat, long, util.reduce(data["crime"][i]["crime_type"]));
  }
  //all testimonial points
  for(let i = 0; i < data["testimonials"].length; i++){
    let lat = data["testimonials"][i].latitude;
    let long  = data["testimonials"][i].longitude;
    if(typeof(lat) === "string"){
      lat = parseFloat(lat);
      long = parseFloat(long);
    }
    all_pts.push({
      "lat" : lat,
      "long" : long
    });
    console.log("adding");
    add_map_point(lat, long, "neutral");
  }
  let ctr = util.getCenter(all_pts);
  let dev = util.getDev(all_pts, ctr["avg-lat"], ctr["avg-long"]);
  //console.log(ctr)
  reset_center(ctr["avg-lat"], ctr["avg-long"], 14 - dev / 20);
}

const reset_center = (lat, lng, zoom_factor) => {
  //console.log("resetting center... " + lat + " " + lng);
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

const add_map_point = (lat, lng, marker_type) => {
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