import * as map from "./modules/map.js";
import * as api from "./modules/api.js";
import * as util from "./modules/util.js"

document.getElementById("map_body").onload = () => { map.initialize_map(); }
document.getElementById("search_btn").onclick = () => {
    let query = document.getElementById("search_entry").value;
    processPlaceQuery(query);
}

const processPlaceQuery = async (place) => {
    let req = {
        "address" : place
    };
    let pts = await api.getData(req);
    let pts_float = [];
    for(let i = 0; i < pts.length; i++){
        pts_float.push({
            "lat" : parseFloat(pts[i].latitude),
            "long" : parseFloat(pts[i].longitude)
        });
    }
    let ctr = util.getCenter(pts_float);
    //console.log(ctr)
    map.reset_center(ctr["avg-lat"], ctr["avg-long"]);
    
    for(let i = 0; i < pts.length; i++){
        map.add_map_point(pts_float[i]["lat"], pts_float[i]["long"]);
    }
}