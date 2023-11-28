const formEl = document.querySelector('#client-form');

formEl.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(formEl);
  if (formData.get('date') == "") {
    alert("Please fill in date.");
    return;
  }
const data = Object.fromEntries(formData);

  fetch('api/Client', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(function(response) {
    return response.json();
  });

    /*fetch(`api/Client/${data}`, {
        method: 'DELETE',
        headers: {
        'Content-Type': 'application/json'
        },
    }).then(function(response) {
        return response.json();
    });*/


})