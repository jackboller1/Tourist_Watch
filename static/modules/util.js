export function getCenter(pts) {
    let n = pts.length;
    let lat_sum = 0;
    let long_sum = 0;
    for(let i = 0; i < n; i++){
        lat_sum += pts[i]["lat"];
        long_sum += pts[i]["long"];
    }
    return {
        "avg-lat" : (lat_sum / n),
        "avg-long" : (long_sum / n) 
    }
}

export function getDev(pts, x, y){
    let res_x = 0;
    let res_y = 0;
    for(let i = 0; i < pts.length; i++){
        res_x += (x - pts[i]["lat"]) * (x - pts[i]["lat"]);
        res_y += (y - pts[i]["long"]) * (y - pts[i]["long"]);
    }
    res_x /= pts.length;
    res_y /= pts.length;
    let res = Math.sqrt(res_x + res_y);
    return res;
}