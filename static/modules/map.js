import * as util from "./util.js"


var map;
var mapLat = 42.2328;
var mapLng = -88.0457;
var mapDefaultZoom = 10;
var layers = []

var curr_data = null;

const ZOOM_SCALE = 1;
const DOMAIN = "localhost:5000";

const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

const popup = new ol.Overlay({
  element: container,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});

closer.onclick = function () {
  popup.setPosition(undefined);
  closer.blur();
  return false;
};

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

const populatePopup = (coord) => {
  let lat = coord[1];
  let long = coord[0];
  if(curr_data["crime"].length > 0){
    //crime is active
    let res = [];
    for(let i = 0; i < curr_data["crime"].length; i++){
      let their_lat = curr_data["crime"][i].latitude;
      let their_long = curr_data["crime"][i].longitude;
      if(typeof(their_lat) === "string"){
        their_lat = parseFloat(their_lat);
        their_long = parseFloat(their_long);
      }
      if(util.dist(lat, long, their_lat, their_long) < 1e-7){
        //console.log(util.dist(lat, long, their_lat, their_long));
        res.push(curr_data["crime"][i]);
      }
    }
    content.innerHTML = "";
    content.innerHTML += `<h3 style="color:lightgray">Found ${res.length} crime(s) at this point:</h3><br>`;
    for(let i = 0; i < res.length; i++){
      let typ = util.reduce(res[i]["crime_type"]);
      let show = util.upperWords(res[i]["crime_type"]);
      let col = "red";
      if(typ === "theft"){
        col = "orange";
        //show = "Theft";
      } else if (typ === "petty_theft"){
        col = "yellow";
        //show = "Petty Theft";
      }
      content.innerHTML += `<font color="${col}">${show}</font><br>`;
    }
  } else {
    //testimonial is active
    let res = [];
    for(let i = 0; i < curr_data["testimonials"].length; i++){
      let their_lat = curr_data["testimonials"][i].latitude;
      let their_long = curr_data["testimonials"][i].longitude;
      if(typeof(their_lat) === "string"){
        their_lat = parseFloat(their_lat);
        their_long = parseFloat(their_long);
      }
      if(util.dist(lat, long, their_lat, their_long) < 5e-6){
        //console.log(util.dist(lat, long, their_lat, their_long));
        res.push(curr_data["testimonials"][i]);
      }
    }
    content.innerHTML = "";
    content.innerHTML += `<h3 style="color:lightgray">Found ${res.length} testimonials(s) at this point:</h3><br>`;
    for(let i = 0; i < res.length; i++){
      let tot_stars = res[i]["total_stars"];
      let num_reviews = res[i]["num_reviews"];
      let rating = tot_stars / num_reviews;
      let id = res[i]._id;
      content.innerHTML += `<font color="lightgray">Avg. Rating: ${rating}</font><br><font color="lightgray">View testimonial: <a href="${DOMAIN}/testimonial/${id}">Click Here</a></font><br><br>`;
    }
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

  map.on("singleclick", (evt) => {
    const coordinate = evt.coordinate;
    const hdms = ol.coordinate.toStringHDMS(ol.proj.toLonLat(coordinate));
  
    populatePopup(ol.proj.toLonLat(coordinate));
    popup.setPosition(coordinate);
  });
  
}

const clearLayers = () => {
  for(let i = 0; i < layers.length; i++){
    map.removeLayer(layers[i]);
  }
  layers = []
}


export const populate = (data) => {
  popup.setPosition(undefined);
  closer.blur();

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
  if(all_pts.length == 0){
    return;
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