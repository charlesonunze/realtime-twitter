const router = require('express').Router();
const mongoose = require('../db/db');
const User = require('../models/User');
const Tweet = require('../models/Tweet');
const passport = require('passport');
const async = require('async');

function protect(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'please log in');
  return res.redirect('/login');
}
// home
router.get('/home', protect, (req, res) => {
  Tweet.find({})
    .sort('-created')
    .populate('owner')
    .exec(function(err, tweets) {
      if (err) return handleError(err);
      if (tweets.length === 0) console.log(`not found`);
      res.render('home', {
        tweets,
      });
    });
});

router.get('/user/:id', protect, (req, res) => {
  async.waterfall([
    function(callback) {
      Tweet.find({
        owner: req.params.id,
      })
        .sort('-created')
        .populate('owner')
        .exec(function(err, tweets) {
          if (err) return console.log(err);
          // if (tweets.length === 0) return console.log(`not found`);
          callback(err, tweets);
        });
    },

    function(tweets, callback) {
      User.findOne({
        _id: req.params.id,
      })
        .sort('-created')
        .populate('followers')
        .populate('following')
        .exec(function(err, user) {
          if (err) return console.log('ERROR:', err);
          if (user.length === 0) return console.log(`not found`);

          let me = req.user._id;
          let followers = user.followers;
          let follows = user.following;
          let User = user;
          var result = followers.filter(obj => obj._id.equals(me));
          if (result.length === 0) {
            res.render('user-profile', {
              tweets,
              following: false,
              follows,
              followers,
            });
          } else {
            res.render('user-profile', {
              tweets,
              following: true,
              follows,
              followers,
            });
          }
        });
    },
  ]);
});

router.post('/follow/:id', protect, (req, res) => {
  // return console.log(req.user);
  async.parallel([
    function(callback) {
      User.findOneAndUpdate(
        {
          _id: req.user._id,
          following: {
            $ne: req.params.id,
          },
        },
        {
          $push: {
            following: req.params.id,
          },
        },
        {
          new: true,
        },
      )
        .then(user => {
          if (!user) return console.log('SERVER_ERROR:', '404!!!!');
          // res.send({ user });
          console.log(user);
          return callback(null, user);
        })
        .catch(e => {
          console.log('SERVER_ERROR:', e);
        });
    },

    function(callback) {
      User.findOneAndUpdate(
        {
          _id: req.params.id,
          followers: {
            $ne: req.user._id,
          },
        },
        {
          $push: {
            followers: req.user._id,
          },
        },
        {
          new: true,
        },
      )
        .then(user => {
          if (!user) return console.log('SERVER_ERROR:', '404!!!!');
          res.json({
            user,
          });
          console.log(user);
          return callback(null, user);
        })
        .catch(e => {
          console.log('SERVER_ERROR:', e);
        });
    },
  ]);
});

router.post('/unfollow/:id', protect, (req, res) => {
  // return console.log(req.user);
  async.parallel([
    function(callback) {
      User.findOneAndUpdate(
        {
          _id: req.user._id,
        },
        {
          $pull: {
            following: req.params.id,
          },
        },
        {
          new: true,
        },
      )
        .then(user => {
          if (!user) return console.log('SERVER_ERROR:', '404!!!!');
          // res.send({ user });
          console.log(user);
          return callback(null, user);
        })
        .catch(e => {
          console.log('SERVER_ERROR:', e);
        });
    },

    function(callback) {
      User.findOneAndUpdate(
        {
          _id: req.params.id,
        },
        {
          $pull: {
            followers: req.user._id,
          },
        },
        {
          new: true,
        },
      )
        .then(user => {
          if (!user) return console.log('SERVER_ERROR:', '404!!!!');
          res.json({
            user,
          });
          console.log(user);
          return callback(null, user);
        })
        .catch(e => {
          console.log('SERVER_ERROR:', e);
        });
    },
  ]);
});

// signup
router
  .route('/register')
  .get((req, res) => {
    if (req.user) return res.redirect('/home');
    res.render('register');
  })
  .post((req, res) => {
    User.findOne({
      username: req.body.username,
    })
      .then(user => {
        if (!user) {
          const user = new User(req.body);
          user
            .save()
            .then(doc => {
              req.flash('success', 'registeration complete, login');
              return res.redirect('/login');
            })
            .catch(e => {
              res.status(400).send(e);
            });
        } else {
          req.flash('error', 'user already exists');
          return res.redirect('/register');
        }
      })
      .catch(e => {
        res.status(400).send(e);
      });
  });

// login
router
  .route('/login')
  .get((req, res) => {
    if (req.user) return res.redirect('/home');
    res.render('login');
  })
  .post((req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/home',
      failureRedirect: '/login',
      failureFlash: true,
    })(req, res, next);
  });

// logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'you are now logged out');
  return res.redirect('/login');
});

module.exports = router;
