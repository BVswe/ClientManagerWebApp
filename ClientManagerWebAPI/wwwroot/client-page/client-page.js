document.querySelector('#pigment-add').addEventListener('click', addPigment);
document.querySelector('#pigment-remove').addEventListener('click', removePigment);
document.querySelector('#touchup-add').addEventListener('click', addTouchup);
document.querySelector('#touchup-remove').addEventListener('click', removeTouchup);
document.querySelector('#media-add').addEventListener('click', addMedia);
document.querySelector('#media-remove').addEventListener('click', removeMedia);
document.querySelector('[name="media"]').onchange = previewImage;
//document.querySelector('#testbutton').addEventListener('click', test);

//function test() {
//    const clientForm = new FormData(document.querySelector('#client-form'));
//    const pigmentsForm = new FormData(document.querySelector('#pigments-form'));
//    const touchupsForm = new FormData(document.querySelector('#touchups-form'));
//    const mediaForm = new FormData(document.querySelector('#media-form'));
//    const pigments = pigmentsForm.getAll("pigment");
//    const touchups = touchupsForm.getAll("touchup");
//    const media = mediaForm.getAll("media");
//    console.log(pigments);
//    for (touchup of touchups) {
//        console.log(JSON.stringify({ TouchupDate : touchup }));
//        console.log(touchup);
//    }
//}

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
    const container = e.target.closest('div');
    const mediaImage = container.querySelector('.media-image')
    const mediaVideo = container.querySelector('.media-video')
    let file = e.target.files[0];
    if (file) {
        if (isVideo(file.name)) {
            console.log(file.name);
        }
        let filePreview = URL.createObjectURL(file);
        mediaImage.src = filePreview;
    }
    else {
        if (mediaImage.src) {
            URL.revokeObjectURL(mediaImage.src);
            mediaImage.src = '';
        }
        if (mediaVideo.src) {
            URL.revokeObjectURL(mediaVideo.src);
            mediaVideo.src = '';
        }
    }
    console.log(mediaImage.src);
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
    const mediaForm = document.querySelector('#media-form');
    const template = document.querySelector('#media-template');
    let clone = template.content.cloneNode(true);
    clone.querySelector('[name="media"]').onchange = previewImage;
    mediaForm.appendChild(clone);
}

function removeMedia() {
    const mediaForm = document.querySelector('#media-form');
    if (mediaForm.length > 1) {
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
    const mediaForm = new FormData(document.querySelector('#media-form'));
    if (clientForm.get('date') == "" || clientForm.get('firstname') == "" || clientForm.get('lastname') == ""){
        alert("Please fill in date.");
        return;
    }
    const pigments = pigmentsForm.getAll("pigment");
    const touchups = touchupsForm.getAll("touchup");
    const media = mediaForm.getAll("media");
    let data = Object.fromEntries(clientForm);
    const clientResponse = await fetch(`https://localhost:7082/api/Client/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    let clientID = clientResponse.JSON.clientID;
    let pigmentArray = [];
    let touchupArray = [];
    let mediaArray = [];
    for (pigment of pigments) {
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
    for (singleMedia of media) {
        //Send multipart form data of media here
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