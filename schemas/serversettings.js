const mongoose = require('mongoose');

const ServerSettingsSchema = new mongoose.Schema({
  guildID: {
    type: mongoose.SchemaTypes.String,
    required: true,
    unique: true,
  },
  logsChannel: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
  bllinkScannedAction: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
  staffrole: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
});

module.exports = mongoose.model('PerServerSettings', ServerSettingsSchema);