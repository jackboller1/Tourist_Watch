const HOSTNAME = "http://localhost:5000";

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
