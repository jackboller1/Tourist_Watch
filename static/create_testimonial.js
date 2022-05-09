import * as api from "./modules/api.js"
import * as util from "./modules/util.js"

const HOSTNAME = (util.LOCAL ? "http://localhost:5000" : "https://touristwatch.herokuapp.com");

document.getElementById("back_btn").onclick = () => {
    window.location.href = HOSTNAME;
}

document.getElementById("submit_btn").onclick = async () => {
    let placename = document.getElementById("placename_in").value;
    let desc = document.getElementById("description_in").value;
    await api.makeTestimonial(placename, desc);
    window.location.href = HOSTNAME;
}