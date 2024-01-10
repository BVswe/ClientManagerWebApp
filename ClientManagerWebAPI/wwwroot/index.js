import { searchDatabase, loadDatabase, getMediaFromDB } from './Modules/database-module.js';

document.querySelector('#search-submit').addEventListener('click', searchSubmitClicked);

document.querySelector('.results-grid').addEventListener('click', resultClicked);

document.querySelector('#search-bar').addEventListener('keydown', enterPressed);

document.querySelector('.sidebar-button').addEventListener('click', redirectToAddClient)

document.querySelector('#load-more').addEventListener('click', loadMore)

const ip = window.location.origin;

async function loadMore() {
    const results = document.querySelectorAll('.card');
    await loadDatabase(results.length)
        .then((results) => {
            (async () => {
                //console.log(results);
                if (results.length == 0) {
                    //console.log(document.querySelector('#load-more'));
                    document.querySelector('#load-more').style.display = 'none';
                    return;
                }
                await displayClients(results);
            })()
        })
        .catch((err) => {
            console.log(err);
        });
}

/**
 * Redirects to the page for adding clients
 */
function redirectToAddClient() {
    window.location.assign(`client-page/client-page.html`);
}

/**
 * Iterates through an array and adds cards to the results based on data given
 * (iterates synchronously, awaits each card that is added to the results)
 * @param {Array} results
 */
async function displayClients(results) {
    //console.log(results);
    for (let i = 0; i < results.length; i++) {
        await addCardToResults(results[i]);
    }
    if (document.querySelectorAll('.card').length >= 10) {
        document.querySelector('#load-more').style.display = 'inline';
    }
    else if (document.querySelectorAll('.card').length == 0) {
        document.querySelector('#no-results').style.display = 'inline';
    }
}

/**
 * Checks that the closest ancestor to the object clicked is a list item, and that the list item has a client ID.
 * After both of these are checked successfully, redirects page to client data.
 * @param {Event} e
 * @returns nothing
 */
function resultClicked(e) {
    let card = e.target.closest('li');
    //Javascript null is falsy
    if (!card) return;
    let cardIDItem = card.querySelector('.card-id');
    if (cardIDItem == null) return;
    if (cardIDItem.innerText == '') {
        alert('Error: Cannot retrieve client data.');
        return;
    }
    window.location.assign(`client-page/client-page.html?id=${cardIDItem.innerText}&edit=false`);
}

/**
 * A function to load database results. If nothing is entered in the search simply loads results from database in order
 * @returns nothing
 */
async function searchSubmitClicked() {
    document.querySelector('#no-results').style.display = 'none';
    const searchText = document.querySelector('#search-bar');
    const resultsList = document.querySelector('.results-grid');
    resultsList.innerHTML = "";
    if (searchText.value == '') {
        await loadDatabase(0)
            .then((results) => {
                (async () => {
                    await displayClients(results);
                })()
            })
            .catch((err) => {
                console.log(err);
            });
        return;
    }

    await searchDatabase(searchText.value).then((results) => {
        (async () => {
            await displayClients(results);
        })()
        })
        .catch((err) => {
            console.log(err);
        });
}

/**
 * Clicks search-submit button when enter is pressed
 * @param {Event} e
 */
function enterPressed(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        document.querySelector('#search-submit').click();
    }
}

/**
 * Adds a card to the search results based on given data from the database from the database
 * @param {JSON} result
 */
async function addCardToResults(data) {
    const resultsList = document.querySelector('.results-grid');
    const template = document.querySelector('#results-item-template');
    let clone = template.content.cloneNode(true);
    clone.querySelector('.card-name').innerText = `${data.firstName} ${data.lastName}`;
    clone.querySelector('.card-phone').innerText = `${data.phone}`;
    clone.querySelector('.card-id').innerText = `${data.clientID}`;
    let image = '';
    let imageUrl = '';
    if (data.mediaName) {
        //image = await getMediaFromDB(data.clientID, data.mediaName);
        //imageUrl = URL.createObjectURL(image);
        //console.log(clone.querySelector('.image'));
        //console.log(imageUrl);
        clone.querySelector('.image').src = `${ip}/api/ClientMedia/${data.clientID}/${data.mediaName}`;
    }
    clone.querySelector('.edit-button').addEventListener('click', function (e) {
        e.stopPropagation();
        let card = e.target.closest('li');
        let id = card.querySelector('.card-id').innerText;
        window.location.assign(`client-page/client-page.html?id=${id}&edit=true`);
    });
    clone.querySelector('.delete-button').addEventListener('click', async function (e) {
        e.stopPropagation();
        let card = e.target.closest('li');
        let name = card.querySelector('.card-name').innerText;
        let id = card.querySelector('.card-id').innerText;
        if (!confirm(`Are you sure you want to delete ${name}?`)) {
            return;
        }
        await fetch(`${ip}/api/Client/${id}`, {
            method: 'DELETE',
            body: console.log(JSON.stringify(data))
        });
        await searchSubmitClicked();
    });
    resultsList.appendChild(clone);
}
////[...document.querySelectorAll('.edit-button')].forEach(function (item) {////    item.addEventListener('click', function (e) {////        e.stopPropagation();////        console.log('Edit Button');////    });////});
////[...document.querySelectorAll('.delete-button')].forEach(function (item) {////    item.addEventListener('click', function (e) {////        e.stopPropagation();////        console.log('Delete Button');////    });////});