import * as map from "./modules/map.js";
import * as api from "./modules/api.js";
import * as util from "./modules/util.js"

/*
Murder

Sexual Assualt -> Assault
Aggravated Assualt -> Assault

Robbery -> Theft
Burglary -> Theft

Theft -> Petty Theft

Motor Vehicle Theft
*/

/*

*/

var data_type = "crimes";

/*
if data type is crimes:
    modifiers just contains crime type
else:
    modifiers[0] -> testimonial category
    modifiers[1] -> min rating
*/
var modifiers = [];

var all_data;

document.getElementById("map_body").onload = () => { map.initialize_map(); }
document.getElementById("search_btn").onclick = () => {
    let query = document.getElementById("search_entry").value;
    processPlaceQuery(query);
}

document.getElementById("select_primary").onchange = () => {
    let val = document.getElementById("select_primary").value;
    filter(0, val);
}

document.getElementById("select_secondary").onchange = () => {
    let val = document.getElementById("select_secondary").value;
    filter(1, val);
}

const processPlaceQuery = async (place) => {
    let req = {
        "address" : place
    };
    all_data = await api.getData(req);
    let filtered_data = {
        "crime" : [],
        "testimonials" : []
    }
    if(data_type === "crime"){
        for(let i = 0; i < all_data["crime"].length; i++){
            if(modifiers.length > 0){
                if(all_data["crime"][i]["type"] === modifiers[0]){
                    filtered_data["crimes"].push(all_data["crime"][i]);
                }
            }
        }
    } else {
        for(let i = 0; i < all_data["testimonials"].length; i++){
            let select = true;
            if(modifiers.length > 0){
                if(all_data["testimonials"][i]["category"] !== modifiers[0]){
                    select = false;
                }
            }
            if(modifiers.length > 1){
                if(all_data["testimonials"][i]["num_upvotes"] < modifiers[1]){
                    select = false;
                }
            }
            if(select){
                filtered_data["testimonials"].push(all_data["testimonials"][i]);
            }
        }
    }
    /*
    TODO: Change below so map handles what type of marker to put, etc. based on stuff in filtered_data
    So, map will accept filtered_data
    */
    for(let i = 0; i < pts.length; i++){
        pts_float.push({
            "lat" : parseFloat(pts[i].latitude),
            "long" : parseFloat(pts[i].longitude)
        });
    }
    let ctr = util.getCenter(pts_float);
    let dev = util.getDev(pts_float, ctr["avg-lat"], ctr["avg-long"]);
    //console.log(ctr)
    map.reset_center(ctr["avg-lat"], ctr["avg-long"], dev);
    
    for(let i = 0; i < pts.length; i++){
        //console.log(pts[i]);
        let type = 1;
        if(pts[i].crime_type.includes("assault")){
            type = 0;
        }
        map.add_map_point(pts_float[i]["lat"], pts_float[i]["long"], type);
    }
}

const add_option = (id, val, inner) => {
    let add = `<option value=${val}>${inner}</option>\n`
    document.getElementById(id).innerHTML += add;
}

const filter = (id, val) => {
    if(id == 0){
        if(val === "crime"){
            data_type = "crimes";
            document.getElementById("select_secondary_label").innerHTML = "Crime Type: ";
            document.getElementById("select_secondary").innerHTML = "";
            add_option("select_secondary", "all", "All");
            add_option("select_secondary", "assualt", "Assualt");
            add_option("select_secondary", "theft", "Theft");
            add_option("select_secondary", "petty-theft", "Petty Theft");
            add_option("select_secondary", "motor-theft", "Motor Vehicle Theft");
        } else {
            data_type = "testimonials";
            document.getElementById("select_secondary_label").innerHTML = "Min Rating: ";
            document.getElementById("select_secondary").innerHTML = "";
            add_option("select_secondary", "1", "1");
            add_option("select_secondary", "2", "2");
            add_option("select_secondary", "3", "3");
            add_option("select_secondary", "4", "4");
            add_option("select_secondary", "5", "5");
        }
    } else {
        if(data_type === "crime"){
            
        } else {

        }
    }
}