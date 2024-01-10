const ip = window.location.origin;

/**
 * Searches database for a client using async await and fetch
 * @param {String} searchString
 * @returns JSON
 */
async function searchDatabase(searchString) {
    const response = await fetch(`${ip}/api/Client/Search?searchInput=${searchString}`);
    if (!response.ok) {
        alert('Could not fetch data from server.');
        return;
    }
    return response.json();
}

/**
 * Loads results from database offset by given parameter
 * @param {Number} offset
 * @returns JSON
 */
async function loadDatabase(offset) {
    const response = await fetch(`${ip}/api/Client?currentOffset=${offset}`);
    if (!response.ok) {
        alert('Could not fetch data from server.');
        return;
    }
    try {
        //console.log(response);
        let jsonResponse = response.json();
        //console.log(jsonResponse);
        return jsonResponse;
    }
    catch (err) {
        return '';
    }
}

/**
 * Fetches all client information for one client from the datbase
 * @param {Number} id
 * @returns JSON
 */
async function getSingleClientInfo(id) {
    const response = await fetch(`${ip}/api/Client/${id}/All`);
    if (!response.ok) {
        alert('Could not fetch data from server.');
        return;
    }
    return response.json();
}

/**
 * Fetches media for a client from the database using given ID and mediaName
 * @param {Number} id
 * @param {String} mediaName
 * @returns Blob
 */
async function getMediaFromDB(id, mediaName) {
    let image = await fetch(`${ip}/api/ClientMedia/${id}/${mediaName}`);
    return image.blob();
}

export { searchDatabase, loadDatabase, getMediaFromDB, getSingleClientInfo }