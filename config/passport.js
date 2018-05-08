const bcrypt = require('bcryptjs');
const { Strategy } = require('passport-local');
const User = require('../models/User');

module.exports = passport => {
  passport.use(
    new Strategy((username, password, done) => {
      User.findOne({ username })
        .then(user => {
          if (!user) return done(null, false, { message: 'No user found' });

          bcrypt.compare(password, user.password, (err, match) => {
            if (err) return console.log(err);

            if (match) return done(null, user, { message: 'Logged in' });

            return done(null, false, { message: 'Wrong password' });
          });
        })
        .catch(e => {
          res.status(400).send(e);
        });
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
