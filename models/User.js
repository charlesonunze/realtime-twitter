const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// create model
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  tweets: [
    {
      tweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
      },
    },
  ],

  picture: {
    type: String,
  },

  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],

  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

UserSchema.pre('save', function(next) {
  let user = this;
  user.picture = `https://api.adorable.io/avatars/285/${
    user.username
  }@adorable.png`;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

// UserSchema.methods.setPic = name => {
//   return
// };

const User = mongoose.model('User', UserSchema);

module.exports = User;
