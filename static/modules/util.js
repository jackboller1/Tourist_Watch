export const LOCAL = false;

export const getCenter = (pts) => {
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

export const getDev = (pts, x, y) => {
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

export const dist = (x1, y1, x2, y2) => {
    let dx = Math.abs(x1 - x2);
    let dy = Math.abs(y1 - y2);
    return (dx*dx + dy*dy);
}

export const reduce = (category) => {
    if(category.includes("assault")){
        return "assault";
    }
    if((category === "robbery") || (category === "burglary") || (category === "motor vehicle theft")){
        return "theft";
    }
    return "petty_theft";
}

export const upperWords = (str) => {
    let res = "";
    res += str.charAt(0).toUpperCase();
    for(let i = 1; i < str.length; i++){
        if(str.charAt(i - 1) == ' '){
            res += str.charAt(i).toUpperCase();
        } else {
            res += str.charAt(i);
        }
    }
    return res;
}