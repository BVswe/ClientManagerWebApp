function searchDatabase(searchString) {
    const resultsList = document.querySelector('.results-grid');
    resultsList.innerHTML = "";
    fetch(`https://localhost:7082/api/Client/Search?searchInput=${searchString}`)
        .then(data => data.json())
        .then(response => displayClients(response));
}

function loadDatabase(offset) {
    fetch(`https://localhost:7082/api/Client?currentOffset=${offset}`)
        .then(data => data.json())
        .then(response => displayClients(response));
}

function displayClients(results) {
    const resultsList = document.querySelector('.results-grid');
    const template = document.querySelector('#results-item-template');
    results.forEach(result => {
        let clone = template.content.cloneNode(true);
        clone.querySelector('.card-name').innerText = `${result.firstName} ${result.lastName}`;
        clone.querySelector('.card-phone').innerText = `${result.phone}`;
        clone.querySelector('.card-id').innerText = `${result.clientID}`;
        let imageUrl = '';
        if (result.mediaName) {
            fetch(`https://localhost:7082/api/ClientMedia/${result.clientID}/${result.mediaName}`)
                .then((response) => response.blob())
                .then((blob) => {
                    imageUrl = URL.createObjectURL(blob);
                    console.log(imageUrl);
                    
                });
            console.log(clone.querySelector('.image'));
            console.log(imageUrl);
            clone.querySelector('.image').src = imageUrl;
        }
        clone.querySelector('.edit-button').addEventListener('click', function (e) {
            e.stopPropagation();
            console.log('Edit Button');
        });
        clone.querySelector('.delete-button').addEventListener('click', function (e) {
            e.stopPropagation();
            console.log('Delete Button');
        });
        resultsList.appendChild(clone);
    });
}

//Takes in an event
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
    redirectToClientData(cardIDItem.innerText);
}

function searchSubmitClicked() {
    const searchText = document.querySelector('#search-bar');
    if (searchText.value == '') {
        const resultsList = document.querySelector('.results-grid');
        resultsList.innerHTML = "";
        loadDatabase(0);
        return;
    }
    searchDatabase(searchText.value);
}

//Takes in an integer ID
function redirectToClientData(clientID) {
    window.location.assign(`../client-page/client-page.html#${clientID}`)
}

//Takes in an event
function enterPressed(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        document.querySelector('#search-submit').click();
    }
}

document.querySelector('#search-submit').addEventListener('click', searchSubmitClicked);

document.querySelector('.results-grid').addEventListener('click', resultClicked);

document.querySelector('#search-bar').addEventListener('keydown', enterPressed);
////[...document.querySelectorAll('.edit-button')].forEach(function (item) {////    item.addEventListener('click', function (e) {////        e.stopPropagation();////        console.log('Edit Button');////    });////});
////[...document.querySelectorAll('.delete-button')].forEach(function (item) {////    item.addEventListener('click', function (e) {////        e.stopPropagation();////        console.log('Delete Button');////    });////});