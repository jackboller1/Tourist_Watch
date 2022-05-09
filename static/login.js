import * as api from "./modules/api.js"
import * as util from "./modules/util.js"

const HOSTNAME = (util.LOCAL ? "http://localhost:5000" : "https://touristwatch.herokuapp.com");

document.getElementById("back_btn").onclick = () => {
    window.location.href = HOSTNAME;
}

document.getElementById("login_btn").onclick = async () => {
    let user_in = document.getElementById("username_in").value;
    let password_in = document.getElementById("password_in").value;

    let res = await api.login(user_in, password_in);
    if(res["status"] == false){
        alert(res["message"]);
    } else {
        window.localStorage.setItem("login", true);
        window.localStorage.setItem("uname", user_in);
        window.location.href = HOSTNAME;
    }
}