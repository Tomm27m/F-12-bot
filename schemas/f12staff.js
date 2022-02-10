const mongoose = require('mongoose');

const F12StaffSchema = new mongoose.Schema({
  adl4: [String],
  adl3: [String],
  adl2: [String],
  adl1: [String],
  adp: [String],
});

module.exports = mongoose.model('StaffSchema', F12StaffSchema);