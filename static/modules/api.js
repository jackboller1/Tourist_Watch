const HOSTNAME = "https://polar-coast-49800.herokuapp.com";

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
