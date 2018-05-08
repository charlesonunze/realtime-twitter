const async = require('async');
const User = require('../models/User');
const Tweet = require('../models/Tweet');

module.exports = io => {
  io.on('connection', socket => {
    console.log('----------------------------------');
    console.log(`New User connected...`);
    const user = socket.request.user;
    console.log('User: ', user.username);
    // console.log('UserObj: ', user);

    socket.on('disconnect', () => {
      console.log('----------------------------------');
      console.log(`User disconnected...`);
    });

    // listening for a 'tweet' event from the client
    socket.on('tweet', data => {
      console.log(data);
      id = user._id;
      body = data.body;
      console.log('ID:', id);
      console.log('BODY:', body);

      async.parallel([
        function(callback) {
          io.emit('message', {
            data,
            user,
          });
        },

        function(callback) {
          async.waterfall([
            function(callback) {
              const tweet = new Tweet({
                owner: id,
                content: body,
              });

              tweet
                .save()
                .then(tweet => {
                  //  req.flash('success', 'registeration complete, login');
                  console.log(tweet);
                  return callback(null, tweet);
                })
                .catch(e => {
                  console.log('SERVER_ERROR:', e);
                });
            },

            function(tweet, callback) {
              console.log('TWEET:', tweet);

              User.findOneAndUpdate(
                { _id: id },
                { $push: { tweets: { tweet: tweet._id } } },
                { new: true },
              )
                .then(tweet => {
                  if (!tweet) return console.log('SERVER_ERROR:', '404!!!!');
                  // res.send({ tweet });
                  console.log(tweet);
                  return callback(null, tweet);
                })
                .catch(e => {
                  console.log('SERVER_ERROR:', e);
                });
            },
          ]);
        },
      ]);
    });
  });
};
