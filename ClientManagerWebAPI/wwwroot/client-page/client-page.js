//TODO: Delete button for each specific pigment/touchup/media
//TODO: Replace placeholders with labels, use placeholders for example inputs

import { getSingleClientInfo, getMediaFromDB } from '../Modules/database-module.js';

document.querySelector('#pigment-add').addEventListener('click', addPigment);
document.querySelector('#pigment-remove').addEventListener('click', removePigment);
document.querySelector('#touchup-add').addEventListener('click', addTouchup);
document.querySelector('#touchup-remove').addEventListener('click', removeTouchup);
document.querySelector('#media-add').addEventListener('click', addMedia);
document.querySelector('#media-remove').addEventListener('click', removeMedia);
document.querySelector('[name="media"]').onchange = previewImage;
document.querySelector('[name="avatar"]').onclick = changeCheckboxValue;
document.querySelector('[name="post-op"]').onclick = changeCheckboxValue;
document.querySelector('#save').addEventListener('click', saveAll);
document.querySelector('.media-delete-button').onclick = removeMediaButton;
document.addEventListener("DOMContentLoaded", loadClient);
//document.querySelector('#testbutton').addEventListener('click', test);

//function test() {
//    const clientForm = new FormData(document.querySelector('#client-form'));
//    const pigmentsForm = new FormData(document.querySelector('#pigments-form'));
//    const touchupsForm = new FormData(document.querySelector('#touchups-form'));
//    const mediaForm = document.querySelectorAll('.media-form');
//    const pigments = pigmentsForm.getAll("pigment");
//    const touchups = touchupsForm.getAll("touchup");
//    for (mediaData of mediaForm) {
//        singleMediaForm = new FormData(mediaData);
//        if (singleMediaForm.get('file') && singleMediaForm.get('media-date') == '') {
//            alert('Please fill in media date')
//            return;
//        }
//        console.log(mediaData);
//    }
//}

async function loadClient() {

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
        let response = await getSingleClientInfo(id);

        //Set client data
        document.querySelector('[name="firstname"]').value = response["firstName"];
        document.querySelector('[name="lastname"]').value = response["lastName"];
        document.querySelector('[name="date"]').value = response["date"];
        document.querySelector('[name="address"]').value = response["address"];
        document.querySelector('[name="email"]').value = response["email"];
        document.querySelector('[name="phone"]').value = response["phone"];
        document.querySelector('[name="comments"]').value = response["comments"];

        //Set pigment data, adding pigments if needed
        let pigmentForm = document.querySelector('#pigments-form');
        let pigments = response["pigments"];
        for (let i = 0; i < pigments.length; i++) {
            if (i != 0) {
                addPigment();
            }
            pigmentForm[pigmentForm.length - 1].value = pigments[i].pigment;
        }

        //Set touchup data, adding touchups if needed
        let touchupsForm = document.querySelector('#touchups-form');
        let touchups = response["touchups"];
        for (let i = 0; i < touchups.length; i++) {
            if (i != 0) {
                addTouchup();
            }
            touchupsForm[touchupsForm.length - 1].value = touchups[i].touchupDate;
        }

        //Set media data, adding media if needed
        let mediaForms = document.querySelector('#media-forms-container');
        let media = response["media"];
        for (let i = 0; i < media.length; i++) {
            if (i != 0) {
                addMedia();
            }
            let currentForm = mediaForms.lastElementChild;
            currentForm.querySelector('[name="media-date"]').value = media[i].mediaDate;
            if (media[i].postOp == true) {
                currentForm.querySelector('[name="post-op"]').value = true;
                currentForm.querySelector('[name="post-op"]').checked = true;
            }
            else {
                currentForm.querySelector('[name="post-op"]').value = false;
                currentForm.querySelector('[name="post-op"]').checked = false;
            }
            if (media[i].avatar == true) {
                currentForm.querySelector('[name="avatar"]').value = true;
                currentForm.querySelector('[name="avatar"]').checked = true;
            }
            else {
                currentForm.querySelector('[name="avatar"]').value = false;
                currentForm.querySelector('[name="avatar"]').checked = false;
            }
            currentForm.querySelector('[name="media"]').style.display = "none";
            let mediaUrl = URL.createObjectURL(await getMediaFromDB(id, media[i].mediaName));
            currentForm.querySelector('.media-image').src = mediaUrl;
            currentForm.querySelector('.media-image').display = "inline";
        }
    }
    const edit = urlParams.get('edit');
    if (edit == "true") {
        //Do Something
        console.log("Editing");
    }
    else {
        let blockingLayer = document.createElement('div');
        blockingLayer.id = "blocking-layer";
        blockingLayer.style.position = "fixed";
        blockingLayer.style.padding = 0;
        blockingLayer.style.margin = 0;
        blockingLayer.style.top = 0;
        blockingLayer.style.left = 0;
        blockingLayer.style.width = "100%";
        blockingLayer.style.height = "100%";
        blockingLayer.style.background = "transparent";
        blockingLayer.style.zIndex = 2;

        let editButton = document.createElement('button');
        editButton.style.position = "absolute";
        editButton.style.right = 0;
        editButton.style.bottom = 0;
        editButton.style.margin = "40px";
        editButton.style.fontSize = "1.25rem";
        editButton.textContent = "Edit";
        editButton.zIndex = 5;
        editButton.onclick = removeBlockingLayer;

        blockingLayer.appendChild(editButton);
        document.body.appendChild(blockingLayer);
    }
}

function removeBlockingLayer() {
    document.querySelector("#blocking-layer").remove();
}

function changeCheckboxValue(e) {
    if (e.target.value == "true") {
        e.target.value = "false";
    }
    else if (e.target.value == "false") {
        e.target.value = "true";
    }
}
    
function addPigment() {
    let newPigment = document.createElement('input');
    newPigment.setAttribute('type', 'text');
    newPigment.setAttribute('name', 'pigment');
    newPigment.setAttribute('placeholder', 'Pigment');
    document.querySelector('#pigments-form').appendChild(newPigment);
}

function removePigment() {
    let pigmentForm = document.querySelector('#pigments-form');
    if (pigmentForm.length > 1) {
        pigmentForm.removeChild(pigmentForm[pigmentForm.length - 1]);
    }
}

function addTouchup() {
    let newTouchup = document.createElement('input');
    newTouchup.setAttribute('type', 'date');
    newTouchup.setAttribute('name', 'touchup');
    document.querySelector('#touchups-form').appendChild(newTouchup);
}

function removeTouchup() {
    let touchupsForm = document.querySelector('#touchups-form');
    if (touchupsForm.length > 1) {
        touchupsForm.removeChild(touchupsForm[touchupsForm.length - 1]);
    }
}

function previewImage(e) {
    addMedia();
    const container = e.target.closest('form');
    const mediaImage = container.querySelector('.media-image')
    const mediaVideo = container.querySelector('.media-video')
    let file = e.target.files[0];
    if (file) {
        if (isVideo(file.name)) {
            mediaImage.style.display = "none";
            mediaVideo.style.display = "inline"
            mediaVideo.src = URL.createObjectURL(file);
        }
        else {
            mediaVideo.style.display = "none"
            mediaImage.style.display = "inline";
            mediaImage.src = URL.createObjectURL(file);
        }
    }
    else {
        if (mediaImage.src) {
            URL.revokeObjectURL(mediaImage.src);
            mediaImage.src = '';
            mediaImage.style.display = "none";
        }
        if (mediaVideo.src) {
            URL.revokeObjectURL(mediaVideo.src);
            mediaVideo.src = '';
            mediaVideo.style.display = "none";
        }
    }
}

function isVideo(filename) {
    let ext = filename.split('.').pop();
    switch (ext.toLowerCase()) {
        case 'm4v':
        case 'avi':
        case 'mpg':
        case 'mp4':
        case 'mov':
            // etc
            return true;
    }
    return false;
}

function addMedia() {
    const mediaForm = document.querySelector('#media-forms-container');
    const template = document.querySelector('#media-template');
    let clone = template.content.cloneNode(true);
    clone.querySelector('[name="media"]').onchange = previewImage;
    clone.querySelector('[name="avatar"]').onclick = changeCheckboxValue;
    clone.querySelector('[name="post-op"]').onclick = changeCheckboxValue;
    clone.querySelector('.media-delete-button').onclick = removeMediaButton;
    mediaForm.appendChild(clone);
}

function removeMediaButton(e) {
    e.target.closest('form').remove();
}

function removeMedia() {
    const mediaForm = document.querySelector('#media-forms-container');
    if (mediaForm.childElementCount > 1) {
        let container = mediaForm.lastElementChild;
        console.log(container.children);
        let containerChild = container.lastElementChild;
        while (containerChild) {
            if (containerChild.lastElementChild) {
                containerChild.removeChild(containerChild.lastElementChild);
            }
            container.removeChild(containerChild);
            containerChild = container.lastElementChild;
        }
        mediaForm.removeChild(container);
    }
}

async function saveAll() {
    const clientForm = new FormData(document.querySelector('#client-form'));
    const pigmentsForm = new FormData(document.querySelector('#pigments-form'));
    const touchupsForm = new FormData(document.querySelector('#touchups-form'));
    const mediaForm = document.querySelectorAll('.media-form');
    if (clientForm.get('date') == "") {
        alert("Please fill in date.");
        return;
    }
    else if (clientForm.get('firstname') == "") {
        alert("Please fill in first name");
        return;
    }
    else if (clientForm.get('lastname') == "") {
        alert("Please fill in last name");
        return;
    }
    for (mediaData of mediaForm) {
        singleMediaForm = new FormData(mediaData);
        if (singleMediaForm.get('media') && singleMediaForm.get('media-date') == '') {
            alert('Please fill in media date')
            return;
        }
    }
    const pigments = pigmentsForm.getAll("pigment");
    const touchups = touchupsForm.getAll("touchup");
    let data = Object.fromEntries(clientForm);
    let clientID = 0;
    await fetch(`https://localhost:7082/api/Client/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(json => clientID = JSON.stringify(json.clientID));
    console.log(clientID);
    let pigmentArray = [];
    let touchupArray = [];
    let mediaArray = [];
    for (pigment of pigments) {
        if (!pigment) {
            continue;
        }
        pigmentArray.push(
            await fetch(`https://localhost:7082/api/ClientPigment/${clientID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pigment: pigment })
            })
        );
    }
    for (touchup of touchups) {
        if (!touchup) {
            continue;
        }
        touchupArray.push(
            await fetch(`https://localhost:7082/api/ClientTouchup/${clientID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ TouchupDate: touchup })
            })
        );
    }
    for (mediaData of mediaForm) {
        let singleMediaForm = new FormData(mediaData);
        if (!singleMediaForm.get('media')) {
            continue;
        }
        console.log(singleMediaForm.get("post-op"));
        console.log(singleMediaForm.get("avatar"));
        let submitMediaForm = new FormData();
        //Make sure "media" (the img/video) always goes last
        submitMediaForm.append("MediaDate", singleMediaForm.get("media-date"));
        if (!singleMediaForm.get("post-op")) {
            submitMediaForm.append("PostOp", "false");
        }
        else {
            submitMediaForm.append("PostOp", singleMediaForm.get("post-op"));
        }
        if (!singleMediaForm.get("avatar")) {
            submitMediaForm.append("Avatar", "false");
        }
        else {
            submitMediaForm.append("Avatar", singleMediaForm.get("avatar"));
        }
        submitMediaForm.append("media", singleMediaForm.get("media"));
        mediaArray.push(
            await fetch(`https://localhost:7082/api/ClientMedia/${clientID}`, {
                method: 'POST',
                body: submitMediaForm
            })
        );
    }
    alert('Client Submitted.')
}
    /*fetch('https://localhost:7082/api/Client/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(function (response) {
        return response.json();
    });
    */

    /*fetch(`api/Client/${data}`, {
        method: 'DELETE',
        headers: {
        'Content-Type': 'application/json'
        },
    }).then(function(response) {
        return response.json();
    });


})*/