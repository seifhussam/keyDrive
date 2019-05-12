const mongoose = require('mongoose');

const { Schema } = mongoose;

const FilesSchema = new Schema({
  filePath: {
    type: String,
    required: true,
    unique: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileKey: {
    type: String,
    required: true,
    unique: true
  },
  userID: {
    type: String,
    required: true
  },
  IV: {
    type: String
  }
});

mongoose.model('Files', FilesSchema);
