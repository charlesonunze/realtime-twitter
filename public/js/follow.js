const input2 = document.getElementById('input');
const id = input2.value;

let unfollow = document.getElementById('unfollow');
let follow = document.getElementById('follow');

if (follow) {
  follow.addEventListener('click', e => {
    follow.textContent = 'following';
    follow.className = 'uk-button uk-button-primary';
    document.getElementById('follow').id = 'unfollow';

    axios
      .post(`/follow/${id}`)
      .then(function(res) {
        console.log('RES::', res.data);
      })
      .catch(function(error) {
        console.log(error);
      });
  });
}

if (unfollow) {
  unfollow.addEventListener('click', e => {
    unfollow.textContent = 'follow';
    unfollow.className = 'uk-button uk-button-secondary';
    document.getElementById('unfollow').id = 'follow';
    follow = document.getElementById('follow');
    axios
      .post(`/unfollow/${id}`)
      .then(function(res) {
        console.log('RES::', res.data);
      })
      .catch(function(error) {
        console.log(error);
      });
  });
}
