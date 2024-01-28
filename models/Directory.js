const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const directorySchema  = new Schema({
  name: {
    type: String,
    required: true,
  },
  pid: {
    type: String,
    default: '',
  },
  isDelete: {
    type: Boolean,
    default: false,
  },
  createdTime: {
    type: Number,
    default: Date.now,
  },
  modifiedTime: {
    type: Number,
    default: Date.now,
  },
});

const Directory = mongoose.model('Directory', directorySchema);

module.exports = Directory;
