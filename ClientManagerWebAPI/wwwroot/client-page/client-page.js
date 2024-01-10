import { getSingleClientInfo, getMediaFromDB } from '../Modules/database-module.js';

const ip = window.location.origin;
let origData = {};

document.querySelector('#pigment-add').addEventListener('click', addPigment);
document.querySelector('#pigment-remove').addEventListener('click', removePigment);
document.querySelector('#touchup-add').addEventListener('click', addTouchup);
document.querySelector('#touchup-remove').addEventListener('click', removeTouchup);
document.querySelector('#media-add').addEventListener('click', addMedia);
document.querySelector('#media-remove').addEventListener('click', removeMedia);
document.querySelector('#fullscreen-image-container').addEventListener('click', fullscreenImageMinimize);
document.querySelector('#save').onclick = saveAll;
document.addEventListener("DOMContentLoaded", loadClient);
document.querySelector('#back-button').setAttribute('href', `${ip}`);

async function loadClient() {

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id') ? urlParams.get('id') : false;
    if (id) {
        let response = await getSingleClientInfo(id);
        //console.log("Response:");
        //console.log(response);
        //Set client data
        document.querySelector('[name="firstname"]').value = response["firstName"];
        document.querySelector('[name="lastname"]').value = response["lastName"];
        document.querySelector('[name="date"]').value = response["date"];
        document.querySelector('[name="address"]').value = response["address"];
        document.querySelector('[name="email"]').value = response["email"];
        document.querySelector('[name="phone"]').value = response["phone"];
        document.querySelector("#comments").textContent = response["comments"];

        origData.firstname = response["firstName"];
        origData.lastname = response["lastName"];
        origData.date = response["date"];
        origData.address = response["address"];
        origData.email = response["email"];
        origData.phone = response["phone"];
        origData.comments = response["comments"];

        //Set pigment data, adding pigments if needed
        let pigmentForm = document.querySelector('#pigments-form');
        let pigments = response["pigments"];
        origData.pigments = [];
        for (let i = 0; i < pigments.length; i++) {
            addPigment();
            let label = pigmentForm.lastElementChild;
            label.querySelector('[name="pigment"]').value = pigments[i].pigment;
            origData.pigments.push(pigments[i].pigment);
        }

        //Set touchup data, adding touchups if needed
        let touchupsForm = document.querySelector('#touchups-form');
        let touchups = response["touchups"];
        origData.touchups = [];
        for (let i = 0; i < touchups.length; i++) {
            addTouchup();
            let label = touchupsForm.lastElementChild;
            label.querySelector('[name="touchup"]').value = touchups[i].touchupDate;
            origData.touchups.push(touchups[i].touchupDate);
        }

        //Set media data, adding media if needed
        let media = response["media"];
        origData.media = [];
        for (let i = 0; i < media.length; i++) {
            let currentForm;
            if (media[i].before == true) {
                addBeforeSection();
                currentForm = addMediaInBeforeSection().lastElementChild;
            }
            else {
                addNewMediaSection(media[i].mediaDate);
                currentForm = addMediaInSection(media[i].mediaDate).lastElementChild;
            }

            currentForm.querySelector('[name="media-date"]').value = media[i].mediaDate;
            if (media[i].before == true) {
                currentForm.querySelector('[name="before"]').value = true;
                currentForm.querySelector('[name="before"]').checked = true;
            }
            else {
                currentForm.querySelector('[name="before"]').value = false;
                currentForm.querySelector('[name="before"]').checked = false;
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
            if (isVideo(media[i].mediaName)) {
                currentForm.querySelector('.media-video').src = `${ip}/api/ClientMedia/${id}/${media[i].mediaName}`;
                currentForm.querySelector('.media-video').style.display = "inline";
                currentForm.querySelector('.media-image').style.display = "none";
            }
            else {
                currentForm.querySelector('.media-image').src = `${ip}/api/ClientMedia/${id}/${media[i].mediaName}`;
                currentForm.querySelector('.media-image').style.display = "inline";
                currentForm.querySelector('.media-video').style.display = "none";
            } 

            origData.media.push({
                blobUrl: currentForm.querySelector('.media-video').src ? currentForm.querySelector('.media-video').src : currentForm.querySelector('.media-image').src,
                mediaName: media[i].mediaName,
                mediaDate: media[i].mediaDate,
                before: currentForm.querySelector('[name="before"]').checked ? true : false,
                avatar: currentForm.querySelector('[name="avatar"]').checked ? true : false,
            });
        }
        //console.log("Original Data:");
        //console.log(origData);
    }
    else {
        let elements = document.querySelectorAll('.invisible-when-viewing');
        let mediaLabels = document.querySelectorAll('.media-label');
        for (let element of elements) {
            element.style.display = "inline";
        }
        for (let label of mediaLabels) {
            label.style.display = "flex";
        }
        addPigment();
        addTouchup();
        addMedia();
    }

    const edit = urlParams.get('edit') ? urlParams.get('edit') : false;
    let arr = window.location.href.split('?');
    if (edit == "true") {
        document.querySelector('#save').onclick = updateAll;
        let elements = document.querySelectorAll('.invisible-when-viewing');
        let mediaLabels = document.querySelectorAll('.media-label');
        for (let element of elements) {
            element.style.display = "inline";
        }
        for (let label of mediaLabels) {
            label.style.display = "flex";
        }
    }
    else if (arr.length > 1 && arr[1] != '') {
        let editButton = document.createElement('button');
        editButton.className = "edit-button";
        editButton.style.position = "relative";
        editButton.textContent = "Edit";
        editButton.style.padding = "5px";
        editButton.zIndex = 6;
        editButton.onclick = editClicked;
        let topbar = document.querySelector('#page-header');
        topbar.appendChild(editButton);
        let inputs = document.querySelectorAll('input');
        for (let input of inputs) {
            input.disabled = true;
        }
        document.querySelector('#comments').setAttribute('contenteditable', false);
        document.querySelector('#comments').style.cursor = 'default';
        let mediaLabelContainer = document.querySelectorAll('.media-label-container')
        for (let container of mediaLabelContainer) {
            container.style.display = 'none';
        }
    }
    let sections = document.querySelectorAll('.media-date-section');
    if (sections && sections.length > 0) {
        for (let i = 0; i < sections.length; i++) {
            if (sections[i].querySelector('.media-date-section-header').textContent == 'Before') {
                continue;
            }
            let dateString = sections[i].querySelector('.media-date-section-header').textContent.split('-');
            sections[i].querySelector('.media-date-section-header').textContent = `${dateString[1]}-${dateString[2]}-${dateString[0]}`;
        }
    }
}

function editClicked() {
    const url = new URL(window.location.href);
    url.searchParams.set("edit", "true")
    window.history.replaceState({} , '', url);
    document.querySelector('#save').onclick = updateAll;
    let inputs = document.querySelectorAll('input');
    for (let input of inputs) {
        input.disabled = false;
    }
    document.querySelector('#comments').setAttribute('contenteditable', true);
    document.querySelector('#comments').style.cursor = 'text';
    let elements = document.querySelectorAll('.invisible-when-viewing');
    let mediaLabelContainer = document.querySelectorAll('.media-label-container');
    for (let container of mediaLabelContainer) {
        container.style.display = 'grid';
    }
    let mediaLabels = document.querySelectorAll('.media-label');
    for (let element of elements) {
        element.style.display = "inline";
    }
    for (let label of mediaLabels) {
        label.style.display = "flex";
    }
    document.querySelector(".edit-button").remove();
}

function changeCheckboxValueAvatar(e) {
    if (e.target.value == "true") {
        e.target.value = "false";
    }
    else if (e.target.value == "false") {
        let checkboxes = document.querySelectorAll('[name = "avatar"]');
        for (let checkbox of checkboxes) {
            checkbox.value = "false";
            checkbox.checked = false;
        }
        e.target.checked = true;
        e.target.value = "true";
    }
}

function changeCheckboxValueBefore(e) {
    if (e.target.value == "true") {
        e.target.value = "false";
    }
    else if (e.target.value == "false") {
        e.target.value = "true";
    }
}
    
function addPigment() {

    let newLabel = document.createElement('label');
    newLabel.className = "input-label";
    newLabel.textContent = "Pigment: ";

    let newPigment = document.createElement('input');
    newPigment.setAttribute('type', 'text');
    newPigment.setAttribute('name', 'pigment');
    newPigment.setAttribute('placeholder', 'Pigment');
    
    let newButton = document.createElement('button');
    newButton.className = "specific-pigment-delete invisible-when-viewing";
    newButton.onclick = removeClosestLabel;
    newButton.textContent = 'X';

    let newDiv = document.createElement('div');
    newDiv.className = "text-button-container";


    const urlParams = new URLSearchParams(window.location.search);
    const edit = urlParams.get('edit') ? urlParams.get('edit') : false;
    if (edit == 'true') {
        newButton.style.display = "inline";
    }

    newDiv.appendChild(newPigment);
    newDiv.appendChild(newButton);
    newLabel.appendChild(newDiv);
    document.querySelector('#pigments-form').appendChild(newLabel);
}

function removePigment() {
    let pigmentForm = document.querySelector('#pigments-form');
    if (pigmentForm.length > 0) {
        pigmentForm.removeChild(pigmentForm.lastElementChild);
    }
}

function addTouchup() {
    let newLabel = document.createElement('label');
    newLabel.className = "input-label";
    newLabel.textContent = "Touchup Date: ";

    let newTouchup = document.createElement('input');
    newTouchup.className = 'date-input'
    newTouchup.setAttribute('type', 'date');
    newTouchup.setAttribute('name', 'touchup');

    let newButton = document.createElement('button');
    newButton.className = "specific-touchup-delete invisible-when-viewing";
    newButton.onclick = removeClosestLabel;
    newButton.textContent = 'X';

    const urlParams = new URLSearchParams(window.location.search);
    const edit = urlParams.get('edit') ? urlParams.get('edit') : false;
    if (edit == 'true') {
        newButton.style.display = "inline";
    }

    let newDiv = document.createElement('div');
    newDiv.className = "text-button-container";

    newDiv.appendChild(newTouchup);
    newDiv.appendChild(newButton);
    newLabel.appendChild(newDiv);
    document.querySelector('#touchups-form').appendChild(newLabel);
}

function removeTouchup() {
    let touchupsForm = document.querySelector('#touchups-form');
    if (touchupsForm.length > 0) {
        touchupsForm.removeChild(touchupsForm.lastElementChild);
    }
}

function removeClosestLabel(e) {
    e.target.closest('label').remove();
}

function previewImage(e) {
    if (document.querySelector('[name="date"]').value && document.querySelector('[name="date"]').value != '') {
        if (e.target.closest('form').querySelector('[name="media-date"]').value == '') {
            e.target.closest('form').querySelector('[name="media-date"]').value = document.querySelector('[name="date"]').value;
        }
    }
    const container = e.target.closest('form');
    const mediaImage = container.querySelector('.media-image');
    const mediaVideo = container.querySelector('.media-video');
    let file = e.target.files[0];
    if (file) {
        if (isVideo(file.name)) {
            mediaImage.style.display = "none";
            mediaVideo.style.display = "inline";
            container.querySelector('[name="avatar"]').style.display = "none";
            mediaVideo.src = URL.createObjectURL(file);
        }
        else {
            mediaVideo.style.display = "none"
            mediaImage.style.display = "inline";
            container.querySelector('[name="avatar"]').style.display = "inline";
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
    let invisElements = container.querySelectorAll('.invisible-when-viewing');
    let mediaLabels = container.querySelectorAll('.media-label');
    for (let i = 0; i < invisElements.length; i++) {
        invisElements[i].style.display = 'inline';
    }
    for (let label of mediaLabels) {
        label.style.display = 'flex';
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

function imageClicked(e) {
    let image = e.target;
    let fullscreenImage = document.querySelector('#fullscreen-image');
    let fullscreenImageContainer = document.querySelector('#fullscreen-image-container');
    fullscreenImageContainer.style.display = "grid";

    fullscreenImage.style.display = "inline";
    fullscreenImage.src = image.src;
}

function fullscreenImageMinimize(e) {
    let fullscreenImageContainer = document.querySelector('#fullscreen-image-container');
    fullscreenImageContainer.style.display = 'none';
    fullscreenImage.style.display = "none";
}

function addMedia() {
    const mediaForm = document.querySelector('#media-forms-container');
    const template = document.querySelector('#media-template');
    let clone = template.content.cloneNode(true);
    clone.querySelector('[name="media"]').onchange = previewImage;
    clone.querySelector('[name="avatar"]').onclick = changeCheckboxValueAvatar;
    clone.querySelector('[name="before"]').onclick = changeCheckboxValueBefore;
    clone.querySelector('.specific-media-delete').onclick = removeMediaButton;
    clone.querySelector('.media-image').onclick = imageClicked;
    if (document.querySelector('[name="date"]').value && document.querySelector('[name="date"]').value != '') {
        clone.querySelector('[name="media-date"]').value = document.querySelector('[name="date"]').value;
    }
    mediaForm.appendChild(clone);
}

function addMediaInSection(date) {
    const mediaForm = document.querySelector('#media-forms-container');
    let sections = mediaForm.querySelectorAll('.media-date-section');
    let correctSection;
    if (sections && sections.length > 0) {
        for (let i = 0; i < sections.length; i++) {
            if (sections[i].querySelector('.media-date-section-header').textContent == date) {
                correctSection = sections[i];
                break;
            }
        }
    }
    const template = document.querySelector('#media-template');
    let clone = template.content.cloneNode(true);
    clone.querySelector('[name="media"]').onchange = previewImage;
    clone.querySelector('[name="avatar"]').onclick = changeCheckboxValueAvatar;
    clone.querySelector('[name="before"]').onclick = changeCheckboxValueBefore;
    clone.querySelector('.specific-media-delete').onclick = removeMediaButton;
    clone.querySelector('.media-image').onclick = imageClicked;
    if (document.querySelector('[name="date"]').value && document.querySelector('[name="date"]').value != '') {
        clone.querySelector('[name="media-date"]').value = document.querySelector('[name="date"]').value;
    }
    //console.log(correctSection);
    if (correctSection) {
        let container = correctSection.querySelector('.media-date-item-container');
        container.appendChild(clone);
        return (container);
    }
    else {
        mediaForm.appendChild(clone);
        return mediaForm;
    }
}

function addNewMediaSection(date) {
    const mediaForm = document.querySelector('#media-forms-container');
    let sections = mediaForm.querySelectorAll('.media-date-section');
    if (sections && sections.length > 0) {
        for (let i = 0; i < sections.length; i++) {
            if (sections[i].querySelector('.media-date-section-header').textContent == date) {
                return;
            }
        }
    }
    let newSection = document.createElement('section');
    newSection.className = 'media-date-section';
    let newH4 = document.createElement('h4');
    newH4.textContent = date;
    newH4.className = 'media-date-section-header';
    newSection.appendChild(newH4);
    let newContainerDiv = document.createElement('div');
    newContainerDiv.className = 'media-date-item-container';
    newSection.appendChild(newContainerDiv);
    if (sections && sections.length > 0) {
        for (let i = 0; i < sections.length; i++) {
            let sectionDate = sections[i].querySelector('.media-date-section-header').textContent;
            if (sectionDate != 'Before' && sectionDate > date) {
                mediaForm.insertBefore(newSection, sections[i]);
                return;
            }
        }
        mediaForm.appendChild(newSection);
    }
    else {
        mediaForm.appendChild(newSection);
    }
}

function addBeforeSection() {
    const mediaForm = document.querySelector('#media-forms-container');
    let sections = mediaForm.querySelectorAll('.media-date-section');
    if (sections && sections.length > 0) {
        for (let i = 0; i < sections.length; i++) {
            if (sections[i].querySelector('.media-date-section-header').textContent == 'Before') {
                return;
            }
        }
    }
    let newSection = document.createElement('section');
    newSection.className = 'media-date-section';
    let newH4 = document.createElement('h4');
    newH4.textContent = 'Before';
    newH4.className = 'media-date-section-header';
    newSection.appendChild(newH4);
    let newContainerDiv = document.createElement('div');
    newContainerDiv.className = 'media-date-item-container';
    newSection.appendChild(newContainerDiv);
    mediaForm.insertBefore(newSection, mediaForm.firstChild);
}

function addMediaInBeforeSection() {
    const mediaForm = document.querySelector('#media-forms-container');
    let sections = mediaForm.querySelectorAll('.media-date-section');
    let correctSection;
    if (sections && sections.length > 0) {
        for (let i = 0; i < sections.length; i++) {
            if (sections[i].querySelector('.media-date-section-header').textContent == 'Before') {
                correctSection = sections[i];
                break;
            }
        }
    }
    const template = document.querySelector('#media-template');
    let clone = template.content.cloneNode(true);
    clone.querySelector('[name="media"]').onchange = previewImage;
    clone.querySelector('[name="avatar"]').onclick = changeCheckboxValueAvatar;
    clone.querySelector('[name="before"]').onclick = changeCheckboxValueBefore;
    clone.querySelector('.specific-media-delete').onclick = removeMediaButton;
    clone.querySelector('.media-image').onclick = imageClicked;
    if (document.querySelector('[name="date"]').value && document.querySelector('[name="date"]').value != '') {
        clone.querySelector('[name="media-date"]').value = document.querySelector('[name="date"]').value;
    }
    //console.log(correctSection);
    if (correctSection) {
        let container = correctSection.querySelector('.media-date-item-container');
        container.appendChild(clone);
        return (container);
    }
    else {
        mediaForm.appendChild(clone);
        return mediaForm;
    }
}

function removeMediaButton(e) {
    e.preventDefault();
    let formToRemove = e.target.closest('form')
    URL.revokeObjectURL(formToRemove.querySelector(".media-image").src);
    URL.revokeObjectURL(formToRemove.querySelector(".media-video").src);
    formToRemove.remove();
}

function removeMedia() {
    const mediaFormsContainer = document.querySelector('#media-forms-container');
    if (mediaFormsContainer.childElementCount > 0) {
        let mediaForm = mediaFormsContainer.lastElementChild;
        URL.revokeObjectURL(mediaForm.querySelector(".media-image").src);
        URL.revokeObjectURL(mediaForm.querySelector(".media-video").src);
        let formElement = mediaForm.lastElementChild;
        while (formElement) {
            if (formElement.lastElementChild) {
                formElement.removeChild(formElement.lastElementChild);
            }
            mediaForm.removeChild(formElement);
            formElement = mediaForm.lastElementChild;
        }
        mediaFormsContainer.removeChild(mediaForm);
    }
}


async function saveAll() {
    document.querySelector('#save-notification-container').style.display = 'grid';
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
    for (let mediaData of mediaForm) {
        let singleMediaForm = new FormData(mediaData);
        if (mediaData.querySelector('[name="media"').files.length > 0 && singleMediaForm.get('media-date') == '') {
            alert('Media date is missing on one or more images/videos. Please fill it in before saving.');
            return;
        }
    }
    const pigments = pigmentsForm.getAll("pigment");
    const touchups = touchupsForm.getAll("touchup");
    let data = Object.fromEntries(clientForm);
    data.comments = document.querySelector("#comments").textContent;

    //console.log(data);

    let clientID = 0;
    await fetch(`${ip}/api/Client/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(json => clientID = JSON.stringify(json.clientID));
    //console.log(clientID);
    for (let pigment of pigments) {
        if (!pigment) {
            continue;
        }
        let response = await fetch(`${ip}/api/ClientPigment/${clientID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pigment: pigment })
        });
        if (!response.ok) {
            console.log(`An error has occured: ${response.status}`);
        }
    }
    for (let touchup of touchups) {
        if (!touchup) {
            continue;
        }
        let response = await fetch(`${ip}/api/ClientTouchup/${clientID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ TouchupDate: touchup })
        });
        if (!response.ok) {
            console.log(`An error has occured: ${response.status}`);
        }
    }
    for (let mediaData of mediaForm) {
        if (mediaData.querySelector('[name="media"').files.length == 0) {
            continue;
        }
        let singleMediaForm = new FormData(mediaData);
        //console.log(singleMediaForm.get("before"));
        //console.log(singleMediaForm.get("avatar"));
        let submitMediaForm = new FormData();
        //Make sure "media" (the img/video) always goes last
        submitMediaForm.append("MediaDate", singleMediaForm.get("media-date"));
        if (!singleMediaForm.get("before")) {
            submitMediaForm.append("Before", "false");
        }
        else {
            submitMediaForm.append("Before", singleMediaForm.get("before"));
        }
        if (!singleMediaForm.get("avatar")) {
            submitMediaForm.append("Avatar", "false");
        }
        else {
            submitMediaForm.append("Avatar", singleMediaForm.get("avatar"));
        }
        submitMediaForm.append("media", singleMediaForm.get("media"));
        let response = await fetch(`${ip}/api/ClientMedia/${clientID}`, {
            method: 'POST',
            body: submitMediaForm
        })
        if (!response.ok) {
            console.log(`An error has occured: ${response.status}`);
        }
    }
    document.querySelector('#save-notification-container').style.display = 'none';
    alert('Client Saved.')
    let url = window.location.href;
    window.location.assign(`${url}?id=${clientID}&edit=false`);
}

async function updateAll() {
    //Create formdata from document
    const clientForm = new FormData(document.querySelector('#client-form'));
    const pigmentsForm = new FormData(document.querySelector('#pigments-form'));
    const touchupsForm = new FormData(document.querySelector('#touchups-form'));

    //Get all the html forms from the page
    const mediaForm = document.querySelectorAll('.media-form');

    //Get search parameters from URL and assign to a variable
    const urlSearchParams = new URLSearchParams(window.location.search);
    let clientID = urlSearchParams.get("id");

    //Check to see if some fields are empty
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
    for (let mediaData of mediaForm) {
        let singleMediaForm = new FormData(mediaData);
        if (mediaData.querySelector('[name="media"').files.length > 0 && singleMediaForm.get('media-date') == '') {
            alert('Media date is missing on one or more images/videos. Please fill it in before saving.')
            return;
        }
    }

    //Grab arrays of client data, pigments, and touchups from their respective forms
    let pigments = pigmentsForm.getAll("pigment");
    let touchups = touchupsForm.getAll("touchup");
    let data = Object.fromEntries(clientForm);
    data.comments = document.querySelector("#comments").textContent;
    //console.log(data);
    //Check if client data is the same as original data from the database (client data is first 6 entries), and if the data is different update it
    if (JSON.stringify(Object.fromEntries(Object.entries(data).slice(0, 7)))
        == JSON.stringify(Object.fromEntries(Object.entries(origData).slice(0, 7)))) {
        //console.log("Same");
    }
    else {
        let response = await fetch(`${ip}/api/Client/${clientID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
            //.then(response => response.json())
            //.then(json => JSON.stringify(json));
        if (!response.ok) {
            console.log(`An error has occured: ${response.status}`);
        }
        //console.log("Different");
    }

    document.querySelector('#save-notification-container').style.display = 'grid';
    await updateDbFromArray(pigments, clientID, "pigment");
    await updateDbFromArray(touchups, clientID, "touchup");
    await updateDbMedia(mediaForm, clientID);
    document.querySelector('#save-notification-container').style.display = 'none';
    window.scrollTo(0, 0);
    
    let url = window.location.href;
    url = url.replace('true', 'false');
    window.location.replace(url);
}

async function updateDbFromArray(newValues, cid, type) {
    //Remove empty/null/etc. from array
    newValues = newValues.filter((x) => x);

    //Clone original pigments to do operations on a new array
    let originalValues;
    if (type == "pigment") {
        originalValues = [...origData.pigments];
    }
    else {
        originalValues = [...origData.touchups];
    }
    

    //Remove duplicate values from both new and original arrays, as these do not need to be touched
    let sameValues = newValues.filter(val => originalValues.includes(val));
    newValues = newValues.filter(val => !sameValues.includes(val));
    originalValues = originalValues.filter(val => !sameValues.includes(val));

    //Get the smaller array to see how many differences to actually update
    let updateCount = Math.min(newValues.length, originalValues.length);

    if (type == "pigment") {
        //console.log("pigment");
        //Update database as many times as necessary
        for (let i = 0; i < updateCount; i++) {
            let response = await fetch(`${ip}/api/ClientPigment/${cid}/${originalValues[i]}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ pigment: newValues[i] })
            });
            if (!response.ok) {
                console.log(`An error has occured: ${response.status}`);
            }
        }

        //Remove updated pigments from both arrays if any were updated
        if (updateCount) {
            newValues.splice(0, updateCount);
            originalValues.splice(0, updateCount);
        }

        //Delete pigments from the database if the array of original pigments still has values
        if (originalValues.length) {
            //console.log("Deleting pigments");
            for (let singlePigment of originalValues) {
                let response = await fetch(`${ip}/api/ClientPigment/${cid}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ pigment: singlePigment })
                });
                if (!response.ok) {
                    console.log(`An error has occured: ${response.status}`);
                }
            }
        }
        //Inserts pigments into the database if the array of new pigments still has values.
        //Only one of this if statement or the one above should run, if more than one runs there's a problem with the logic
        if (newValues.length) {
            //console.log("Adding pigments");
            for (let singlePigment of newValues) {
                let response = await fetch(`${ip}/api/ClientPigment/${cid}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ pigment: singlePigment })
                });
                if (!response.ok) {
                    console.log(`An error has occured: ${response.status}`);
                }
            }
        }
    }
    else {
        //console.log("touchup");
        //Update database as many times as necessary
        for (let i = 0; i < updateCount; i++) {
            let response = await fetch(`${ip}/api/ClientTouchup/${cid}/${originalValues[i]}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ TouchupDate: newValues[i] })
            });
            if (!response.ok) {
                console.log(`An error has occured: ${response.status}`);
            }
        }

        //Remove updated touchups from both arrays if any were updated
        if (updateCount) {
            newValues.splice(0, updateCount);
            originalValues.splice(0, updateCount);
        }

        //Delete touchups from the database if the array of original touchups still has values
        if (originalValues.length) {
            //console.log("Deleting touchups");
            for (let singleTouchup of originalValues) {
                let response = await fetch(`${ip}/api/ClientTouchup/${cid}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ TouchupDate: singleTouchup })
                });
                if (!response.ok) {
                    console.log(`An error has occured: ${response.status}`);
                }
            }
        }
        //Inserts touchups into the database if the array of new touchups still has values.
        //Only one of this if statement or the one above should run, if more than one runs there's a problem with the logic
        if (newValues.length) {
            //console.log("Adding touchups");
            for (let singleTouchup of newValues) {
                let response = await fetch(`${ip}/api/ClientTouchup/${cid}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ TouchupDate: singleTouchup })
                });
                if (!response.ok) {
                    console.log(`An error has occured: ${response.status}`);
                }
            }
        }
    }
}

async function updateDbMedia(mediaForm, cid) {
    let origMedia = [...origData.media];
    for (let mediaData of mediaForm) {
        //console.log(1);
        let singleMediaForm = new FormData(mediaData);
        if (!mediaData.querySelector('[name="media"]').value && mediaData.querySelector('[name="media"]').style.display != 'none') {
            continue;
        }
        if (!singleMediaForm.get('before')) {
            singleMediaForm.append("before", false);
        }
        if (!singleMediaForm.get('avatar')) {
            singleMediaForm.append("avatar", false);
        }
        //console.log(mediaData.querySelector('[name="media"]').value);
        if (!mediaData.querySelector('[name="media"]').value && mediaData.querySelector('[name="media"]').style.display == 'none') {
            let mediaUrl = mediaData.querySelector(".media-image").src ? mediaData.querySelector(".media-image").src : mediaData.querySelector(".media-video").src;
            let matchedIndex;
            for (let i = 0; i < origMedia.length; i++) {
                //console.log(mediaUrl);
                //console.log(origMedia[i].blobUrl);
                if (mediaUrl == origMedia[i].blobUrl) {
                    matchedIndex = i;
                    break;
                }
            }
            if (matchedIndex != null) {
                
                //console.log(origMedia[matchedIndex].before.toString());
                //console.log(singleMediaForm.get('before'));
                //console.log(origMedia[matchedIndex].avatar.toString());
                //console.log(singleMediaForm.get('avatar'));
                //console.log(origMedia[matchedIndex].mediaDate);
                //console.log(singleMediaForm.get('media-date'));
                
                if (!(origMedia[matchedIndex].before.toString() == singleMediaForm.get('before')
                    && origMedia[matchedIndex].avatar.toString() == singleMediaForm.get('avatar')
                    && origMedia[matchedIndex].mediaDate == singleMediaForm.get('media-date'))) {
                    //console.log("fetching media update");

                    let response = await fetch(`${ip}/api/ClientMedia/${cid}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            MediaName: origMedia[matchedIndex].mediaName, Before: singleMediaForm.get('before') === "false" ? false : true,
                            Avatar: singleMediaForm.get('avatar') === "false" ? false : true, MediaDate: singleMediaForm.get('media-date')
                        })
                    });
                    if (!response.ok) {
                        console.log(`An error has occured: ${response.status}`);
                    }
                }
                origMedia.splice(matchedIndex, 1);
            }
        }
        else if (mediaData.querySelector('[name="media"]').value) {
            let submitMediaForm = new FormData();
            //Make sure "media" (the img/video) always goes last
            submitMediaForm.append("MediaDate", singleMediaForm.get("media-date"));
            if (!singleMediaForm.get("before")) {
                submitMediaForm.append("Before", "false");
            }
            else {
                submitMediaForm.append("Before", singleMediaForm.get("before"));
            }
            if (!singleMediaForm.get("avatar")) {
                submitMediaForm.append("Avatar", "false");
            }
            else {
                submitMediaForm.append("Avatar", singleMediaForm.get("avatar"));
            }
            submitMediaForm.append("media", singleMediaForm.get("media"));
            let response = await fetch(`${ip}/api/ClientMedia/${cid}`, {
                method: 'POST',
                body: submitMediaForm
            });
            if (!response.ok) {
                console.log(`An error has occured: ${response.status}`);
            }
        }
    }
    for (let origData of origMedia) {
        let response = await fetch(`${ip}/api/ClientMedia/${cid}/${origData.mediaName}`, {
            method: 'DELETE',
        })
        if (!response.ok) {
            console.log(`An error has occured: ${response.status}`);
        }
    }
}