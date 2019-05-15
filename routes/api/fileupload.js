const mongoose = require('mongoose');
const Files = mongoose.model('Files');
const router = require('express').Router();
const auth = require('../auth');
const fs = require('fs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const encryptor = require('file-encryptor');
const algorithm = 'aes256';

const secret = require('../../config/passportConfig.json').secret;
const uploadPath = __dirname + '/../../uploads/';

router.post('/', auth.required, (req, res, next) => {
  let uploadFile = req.files.file;
  // console.log(uploadFile);
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
        const userPath = uploadPath + decodded.email + decodded.id;
        if (!fs.existsSync(userPath)) {
          fs.mkdirSync(userPath);
        }

        const tempPath = `${uploadPath + 'Temp/' + dateTime + fileName}`;
        // const tempPath = `${uploadPath + 'Temp/' + fileName}`;

        uploadFile.mv(tempPath, function(err) {
          if (err) {
            console.log(err);

            return res.status(400).send(err);
          }

          const key = crypto.randomBytes(64).toString('base64');
          // const iv = crypto.randomBytes(16);

          File.fileKey = key;
          File.userID = decodded.id;
          //File.IV = iv.toString('hex');

          const pathToFileEnc = `${userPath +
            '/' +
            dateTime +
            '_enc_' +
            fileName}`;

          File.filePath = '/' + dateTime + '_enc_' + fileName;

          encryptor.encryptFile(
            tempPath,
            pathToFileEnc,
            key,
            { algorithm: algorithm },
            err => {
              if (err) {
                return res.status(400).json({ err: err });
              }
              fs.unlink(tempPath, function(err) {
                if (err) {
                  return res.status(400).json({ err: err });
                } else {
                  const finalFile = new Files(File);
                  finalFile
                    .save()
                    .then(() => {
                      res.json({
                        file: File.filePath
                      });
                    })
                    .catch(err => {
                      console.log(err);

                      return res
                        .status(422)
                        .json({ msg: 'something went wrong!' });
                    });
                }
              });
            }
          );
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
        return res.status(401).send(err);
      } else {
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
  if (req.cookies.token) {
    jwt.verify(req.cookies.token, secret, (err, decodded) => {
      if (err) {
        return res.status(401).send(err);
      } else {
        const userPath = uploadPath + decodded.email + decodded.id;
        const filePath = userPath + JSON.parse(req.body).file;
        fs.unlink(filePath, function(err) {
          if (err) return res.status(400).json({ err });
          // if no error, file has been deleted successfully
          console.log('File deleted!');
          Files.deleteOne({ filePath: JSON.parse(req.body).file }, err => {
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

router.delete('/delete', auth.required, (req, res) => {
  if (req.cookies.token) {
    jwt.verify(req.cookies.token, secret, (err, decodded) => {
      if (err) {
        return res.status(401).send(err);
      } else {
        const userPath = uploadPath + decodded.email + decodded.id;
        const filePath = userPath + req.query.file;
        fs.unlink(filePath, function(err) {
          if (err) return res.status(400).json({ err });
          // if no error, file has been deleted successfully
          console.log('File deleted!');
          Files.deleteOne({ filePath: req.query.file }, err => {
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
        return res.status(401).json(err);
      } else {
        const userPath = uploadPath + decodded.email + decodded.id;
        const directoryPath = userPath + req.query.file;

        fs.stat(directoryPath, function(err, stat) {
          if (err) {
            return res.status(404).json({ err });
          } else {
            Files.findByFilePath(req.query.file, (err, data) => {
              const pathToFileDec = `${uploadPath +
                'DownTemp/' +
                data.fileName}`;
              encryptor.decryptFile(
                directoryPath,
                pathToFileDec,
                data.fileKey,
                { algorithm: algorithm },
                err => {
                  if (err) {
                    return res.status(400).json({ err });
                  }
                  fs.stat(pathToFileDec, (err, stats) => {
                    if (err) {
                      return res.status(400).json({ err });
                    } else {
                      return res.download(pathToFileDec, data.fileName, err => {
                        fs.unlink(pathToFileDec, function(err) {});
                      });
                    }
                  });
                }
              );
            });
          }
        });
      }
    });
  } else {
    return res.status(401).json({ err: 'token not found' });
  }
});

module.exports = router;
