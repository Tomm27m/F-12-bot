const mongoose = require('mongoose');

const BlacklistSchema = new mongoose.Schema({
  sender: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
  senderID: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
  link: {
    type: mongoose.SchemaTypes.String,
    required: true,
    unique: true,
  },
  main: {
    type: mongoose.SchemaTypes.String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model('BlacklistedLinks', BlacklistSchema);