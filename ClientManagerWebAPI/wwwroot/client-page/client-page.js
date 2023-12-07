document.querySelector('#client-form').addEventListener('submit', saveClient);
document.querySelector('#pigment-add').addEventListener('click', addPigment);
document.querySelector('#pigment-remove').addEventListener('click', removePigment);
document.querySelector('#touchup-add').addEventListener('click', addTouchup);
document.querySelector('#touchup-remove').addEventListener('click', removeTouchup);
document.querySelector('#media-add').addEventListener('click', addMedia);
document.querySelector('#media-remove').addEventListener('click', removeMedia);
document.querySelector('[name="media"]').onchange = previewImage;

async function saveClient(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (formData.get('date') == "") {
        alert("Please fill in date.");
        return;
    }
    const data = Object.fromEntries(formData);
    const response = await fetch('https://localhost:7082/api/Client/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response.json();
}
    
function addPigment() {
    let newPigment = document.createElement('input');
    newPigment.setAttribute('type', 'text');
    newPigment.setAttribute('name', 'pigment');
    newPigment.setAttribute('placeholder', 'Pigment');
    document.querySelector('#pigments-form').appendChild(newPigment);
}

function removePigment() {
    let pigmentForms = document.querySelector('#pigments-form');
    if (pigmentForms.length > 1) {
        pigmentForms.removeChild(pigmentForms[pigmentForm.length - 1]);
    }
}

function addTouchup() {
    let newTouchup = document.createElement('input');
    newTouchup.setAttribute('type', 'date');
    newTouchup.setAttribute('name', 'touchup');
    newTouchup.setAttribute('placeholder', 'Touchup Date');
    document.querySelector('#touchups-form').appendChild(newTouchup);
}

function removeTouchup() {
    let touchupsForm = document.querySelector('#touchups-form');
    if (touchupsForm.length > 1) {
        touchupsForm.removeChild(touchupsForm[touchupsForm.length - 1]);
    }
}

function previewImage(e) {
    const container = e.target.closest('div');
    const mediaImage = container.querySelector('.media-image')
    let file = e.target.files[0];
    if (file) {
        let filePreview = URL.createObjectURL(file);
        mediaImage.src = filePreview;
    }
    else {
        mediaImage.src = '';
    }
    console.log(mediaImage.src);
}

function addMedia() {
    const mediaForm = document.querySelector('#media-form');
    let newMediaContainer = document.createElement('div');
    let newMediaUpload = document.createElement('input');
    let newMediaImage = document.createElement('img');
    newMediaContainer.setAttribute('class', 'media-container');
    newMediaUpload.setAttribute('type', 'file');
    newMediaUpload.setAttribute('name', 'media');
    newMediaUpload.setAttribute('title', ' ');
    newMediaUpload.setAttribute('accept', 'image/*, video/*');
    newMediaUpload.onchange = previewImage;
    newMediaContainer.appendChild(newMediaUpload);
    newMediaImage.setAttribute('class', 'media-image');
    newMediaContainer.appendChild(newMediaImage);
    mediaForm.appendChild(newMediaContainer);
}

function removeMedia() {
    let mediaForm = document.querySelector('#media-form');
    if (mediaForm.length > 1) {
        let container = mediaForm.lastChild;
        let containerChild = container.lastChild;
        while (containerChild) {
            container.removeChild(containerChild);
            containerChild = container.lastElementChild;
        } 
    }
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