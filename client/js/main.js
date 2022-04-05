import * as map from "./modules/map.js";
import * as api from "./modules/api.js";

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
    for(let i = 0; i < pts.length; i++){
        map.add_map_point(parseFloat(pts[i].latitude), parseFloat(pts[i].longitude));
    }
}