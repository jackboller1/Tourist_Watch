import * as map from "./modules/map.js";
import * as api from "./modules/api.js";
import * as util from "./modules/util.js"


var data_type = "crimes";

/*
if data type is crimes:
    modifiers just contains crime type
else:
    modifiers[0] -> testimonial category
    modifiers[1] -> min rating
*/
var modifiers = [];

var all_data = null;

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

document.getElementById("logout").onclick = () => {
    window.localStorage.clear();
}

document.getElementById("submit-testimonial").style.display = "none";
document.getElementById("logout").style.display = "none";

if(window.localStorage.getItem("login") != null && window.localStorage.getItem("login")){
    document.getElementById("greeting").style.display = "initial";
    document.getElementById("greeting").innerHTML = `Hi, ${window.localStorage.getItem("uname")}     `;
    document.getElementById("submit-testimonial").style.display = "initial";
    document.getElementById("logout").style.display = "initial";

    document.getElementById("login").style.display = "none";
    document.getElementById("register").style.display = "none";
}

const applyFilters = () => {
    if(all_data == null){
        return;
    }
    let filtered_data = {
        "crime" : [],
        "testimonials" : []
    }
    console.log(all_data);
    console.log(data_type);
    console.log(modifiers[0]);
    if(data_type === "crimes"){
        for(let i = 0; i < all_data[0].length; i++){
            let lbl = util.reduce(all_data[0][i]["crime_type"]);
            if(modifiers.length > 0){
                if((modifiers[0] === "all") || (lbl === modifiers[0])){
                    filtered_data["crime"].push(all_data[0][i]);
                }
            } else {
                filtered_data["crime"].push(all_data[0][i]);
            }
        }
    } else {
        for(let i = 0; i < all_data[1].length; i++){
            if(modifiers.length > 0){
                let num_stars = all_data[1][i]["total_stars"];
                let num_raters = all_data[1][i]["num_reviews"];
                let avg_stars = num_stars / num_raters;
                let thresh = parseInt(modifiers[0]);
                let show = false;
                if(num_raters == 0){
                    show = (thresh == 1);
                } else {
                    show = (avg_stars >= thresh);
                }
                if(show){
                    filtered_data["testimonials"].push(all_data[1][i]);
                }
            } else {
                filtered_data["testimonials"].push(all_data[1][i]);
            }
        }
    }
    map.populate(filtered_data);
}

const processPlaceQuery = async (place) => {
    let req = {
        "address" : place
    };
    all_data = await api.getData(req);
    console.log(all_data);
    applyFilters();
}

const add_option = (id, val, inner) => {
    let add = `<option value=${val}>${inner}</option>\n`
    document.getElementById(id).innerHTML += add;
}

const filter = (id, val) => {
    if(id == 0){
        if(val === "crime"){
            data_type = "crimes";
            modifiers = [];
            document.getElementById("select_secondary_label").innerHTML = "Crime Type: ";
            document.getElementById("select_secondary").innerHTML = "";
            add_option("select_secondary", "all", "All");
            add_option("select_secondary", "assault", "Assault");
            add_option("select_secondary", "theft", "Theft");
            add_option("select_secondary", "petty_theft", "Petty Theft");
        } else {
            data_type = "testimonials";
            modifiers = [];
            document.getElementById("select_secondary_label").innerHTML = "Min Rating: ";
            document.getElementById("select_secondary").innerHTML = "";
            add_option("select_secondary", "1", "1");
            add_option("select_secondary", "2", "2");
            add_option("select_secondary", "3", "3");
            add_option("select_secondary", "4", "4");
            add_option("select_secondary", "5", "5");
        }
    } else {
        modifiers = [];
        modifiers.push(val);
        console.log(`newval: ${val}`);
    }
    applyFilters();
}