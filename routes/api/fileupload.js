const mongoose = require('mongoose');
const Files = mongoose.model('Files');
const router = require('express').Router();
const auth = require('../auth');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const secret = require('../../config/passportConfig.json').secret;
const uploadPath = __dirname + '/../../uploads/';

router.post('/', auth.required, (req, res, next) => {
  let uploadFile = req.files.file;
  const fileName = req.files.file.name;
  let File = {
    fileName: fileName
  };
  const dateTime = new Date().getTime();
  if (req.cookies.token) {
    jwt.verify(req.cookies.token, secret, (err, decodded) => {
      if (err) {
        console.log(err);
        return res.status(401).send(err);
      } else {
        let userPath = uploadPath + decodded.email + decodded.id;
        if (!fs.existsSync(userPath)) {
          fs.mkdirSync(userPath);
        }
        uploadFile.mv(`${userPath + '/' + dateTime + fileName}`, function(err) {
          if (err) {
            console.log(err);

            return res.status(400).send(err);
          }
          File.filePath = userPath + '/' + dateTime + fileName;
          File.fileKey = dateTime + fileName;
          File.userID = decodded.id;

          const finalFile = new Files(File);

          finalFile
            .save()
            .then(() => {
              res.json({
                file: `${userPath + '/' + dateTime + fileName}`
              });
            })
            .catch(err => {
              console.log(err);

              return res.status(422).json({ msg: 'something went wrong!' });
            });
        });
      }
    });
  } else {
    return res.status(401).json({ err: 'token not found' });
  }
});

router.get('/', auth.required, (req, res) => {
  if (req.cookies.token) {
    jwt.verify(req.cookies.token, secret, (err, decodded) => {
      if (err) {
        console.log(err);
        return res.status(401).send(err);
      } else {
        const directoryPath = uploadPath + decodded.email + decodded.id;
        console.log(directoryPath);
        Files.find(
          { userID: decodded.id },
          { fileName: 1, _id: 0, filePath: 1 },
          (err, data) => {
            if (err) {
              return res.status(401).json({ err: 'something bad happen' });
            }
            return res.status(200).json(data);
          }
        );
      }
    });
  } else {
    return res.status(401).json({ err: 'token not found' });
  }
});

router.delete('/', auth.required, (req, res) => {
  const filePath = JSON.parse(req.body).file;
  console.log(filePath);
  fs.unlink(filePath, function(err) {
    if (err) return res.status(400).json({ err });
    // if no error, file has been deleted successfully
    console.log('File deleted!');
    Files.deleteOne({ filePath }, err => {
      if (err) {
        return res.status(400).json({ err });
      }
      return res.sendStatus(200);
    });
  });
});

router.delete('/delete', auth.required, (req, res) => {
  if (req.cookies.token) {
    jwt.verify(req.cookies.token, secret, (err, decodded) => {
      if (err) {
        console.log(err);
        return res.status(401).send(err);
      } else {
        const filePath = req.query.file;
        console.log(filePath);
        fs.unlink(filePath, function(err) {
          if (err) return res.status(400).json({ err });
          // if no error, file has been deleted successfully
          console.log('File deleted!');
          Files.deleteOne({ filePath }, err => {
            if (err) {
              return res.status(400).json({ err });
            }
            return res.sendStatus(200);
          });
        });
      }
    });
  } else {
    return res.status(401).json({ err: 'token not found' });
  }
});

router.get('/download', auth.required, (req, res) => {
  if (req.cookies.token) {
    jwt.verify(req.cookies.token, secret, (err, decodded) => {
      if (err) {
        console.log(err);
        return res.status(401).send(err);
      } else {
        const directoryPath =
          uploadPath + decodded.email + decodded.id + '/' + req.query.file;
        try {
          if (fs.existsSync(directoryPath)) {
            //file exists
            return res.download(directoryPath);
          }
        } catch (err) {
          return res.status(400).json({ err: err });
        }
      }
    });
  } else {
    return res.status(401).json({ err: 'token not found' });
  }
});

module.exports = router;
