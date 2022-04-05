const HOSTNAME = "http://127.0.0.1";

export const getData = (place) => {
    let response = await fetch(`{HOSTNAME}/api/getData`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(place)
    });
    let res = await response.json();
    let points = {}
    
}