const mongoose = require('mongoose');

// create model
const TweetSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  content: {
    type: String,
  },

  created: {
    type: Date,
    default: Date.now,
  },
});

const Tweet = mongoose.model('Tweet', TweetSchema);

module.exports = Tweet;
