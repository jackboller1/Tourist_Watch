import * as util from "./util.js"

const HOSTNAME = (util.LOCAL ? "http://localhost:5000" : "https://touristwatch.herokuapp.com/");

export const login = async (username, pass) => {
    let response = await fetch(`${HOSTNAME}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
            'user_name' : username,
            'password' : pass
        })
    });
    return await response.json();
}

export const register = async (username, pass) => {
    let response = await fetch(`${HOSTNAME}/sign-up`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
            'user_name' : username,
            'password' : pass
        })
    });
    return await response.json();
}

export const makeTestimonial = async (place, desc) => {
    let response = await fetch(`${HOSTNAME}/create-testimonial`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
            'address' : place,
            'category' : "",
            'text' : desc
        })
    });
    return await response.json();
}

export const getData = async (place) => {
    let response = await fetch(`${HOSTNAME}/city`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(place)
    });
    return await response.json();
}
