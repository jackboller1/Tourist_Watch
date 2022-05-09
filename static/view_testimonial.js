import * as api from "./modules/api.js"
import * as util from "./modules/util.js"

const HOSTNAME = (util.LOCAL ? "http://localhost:5000" : "https://touristwatch.herokuapp.com");

const TESTIMONIAL_ID = window.location.href.split("/testimonial/")[1];

var curr_rating = "?";

var testimonial = await api.getTestimonial(TESTIMONIAL_ID);
var username = testimonial["username"];
var myStars = testimonial["user_num_stars"];
var place = testimonial["city"];
var description = testimonial["text"];

var tot_stars = testimonial["total_stars"];
var tot_raters = testimonial["num_reviews"];
var avg = ((tot_raters == 0) ? "N/A" : (tot_stars / tot_raters).toPrecision(2));

if((username === window.localStorage.getItem("uname")) || (window.localStorage.getItem("uname") == null)){
    document.getElementById("rating_selection").style.visibility = "hidden";
}

if(myStars != -1){
    document.getElementById("star_select").value = myStars.toString();
}

document.getElementById("title").innerHTML = `${username} @ ${place} says`;
document.getElementById("description").innerHTML = description;
document.getElementById("stars").innerHTML = `${avg} stars from ${tot_raters} users`;

document.getElementById("star_select").onchange = () => {
    let val = document.getElementById("star_select").value;
    curr_rating = val;
}

document.getElementById("back_btn").onclick = () => {
    window.close();
}

document.getElementById("submit_rating").onclick = async () => {
    if(curr_rating === "?"){
        alert("Please select a rating [1-5]");
        return;
    }
    let res = await api.sendRating(TESTIMONIAL_ID, curr_rating);
    if(res["status"]){
        alert("Your rating has been recorded");
    }
}