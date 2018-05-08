const socket = io();

// client connect
socket.on('connect', () => {
  console.log(`client connected...`);
});
// client disconnect
socket.on('disconnect', () => {
  console.log(`client disconnected...`);
});

window.onload = function() {
  document.getElementById('loading').style.display = 'none';
};

const form = document.getElementById('form');
const input = document.querySelector('input[name="tweet"]');

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    // send message to the server
    socket.emit('tweet', { body: input.value }, data => {
      console.log(data);
    });
    // clear input field
    input.value = '';
  });
}

socket.on('message', data => {
  console.log('----------------------------------');
  console.log(data);

  let div = document.createElement('div');

  div.innerHTML = `
    <div class="uk-card-header" style="padding-left: 10px">
        <div class="uk-grid-small uk-flex-middle" uk-grid>
            <div class="uk-width-auto">
                <img class="uk-border-circle" width="45" height="45" src=${
                  data.user.picture
                }>
            </div>
            <div class="uk-width-expand">
                <p class="uk-card-title uk-margin-remove-bottom">${
                  data.user.username
                }</p>
                <p class="uk-text-meta uk-margin-remove-top">${
                  data.data.body
                }</p>
            </div>
        </div>
    </div>
  `;

  if (data.tweet === '') {
    input.value = '';
    return;
  }

  let body = document.getElementById('body');
  body.appendChild(div);
});
