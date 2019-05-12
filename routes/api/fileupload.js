const router = require('express').Router();
const auth = require('../auth');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const secret = require('../../config/passportConfig.json').secret;

const uploadPath = __dirname + '/../../uploads/';

router.post('/', auth.required, (req, res, next) => {
  let uploadFile = req.files.file;
  const fileName = req.files.file.name;
  const dateTime = new Date().getTime();
  if (req.cookies.token) {
    jwt.verify(req.cookies.token, secret, (err, decodded) => {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      } else {
        let userPath = uploadPath + decodded.email + decodded.id;
        if (!fs.existsSync(userPath)) {
          fs.mkdirSync(userPath);
        }
        uploadFile.mv(`${userPath + '/' + dateTime + fileName}`, function(err) {
          if (err) {
            console.log(err);

            return res.status(500).send(err);
          }

          res.json({
            file: `${userPath + '/' + dateTime + fileName}`
          });
        });
      }
    });
  } else {
    return res.status(500).json({ err: 'token not found' });
  }
});

router.get('/', auth.required, (req, res) => {
  if (req.cookies.token) {
    jwt.verify(req.cookies.token, secret, (err, decodded) => {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      } else {
        const directoryPath = uploadPath + decodded.email + decodded.id;
        console.log(directoryPath);
        fs.readdir(directoryPath, function(err, files) {
          //handling error
          if (err) {
            return res.status(500).json({ err: 'something bad happen' });
          }
          //listing all files using forEach
          files.forEach(function(file) {
            // Do whatever you want to do with the file
            console.log(file);
          });

          res.status(200).json(files);
        });
      }
    });
  } else {
    return res.status(500).json({ err: 'token not found' });
  }
});

router.delete('/', auth.required, (req, res) => {
  const filePath = JSON.parse(req.body).file;
  console.log(filePath);
  fs.unlink(filePath, function(err) {
    if (err) res.status(400).json({ err });
    // if no error, file has been deleted successfully
    console.log('File deleted!');
    res.sendStatus(200);
  });
});

module.exports = router;
