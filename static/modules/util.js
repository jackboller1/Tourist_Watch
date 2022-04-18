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