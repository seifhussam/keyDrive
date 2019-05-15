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

FilesSchema.statics.findByFilePath = function(filePath, cb) {
  return this.findOne(
    { filePath },
    { fileKey: 1, IV: 1, _id: 0, fileName: 1 },
    cb
  );
};

mongoose.model('Files', FilesSchema);
