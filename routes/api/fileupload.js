const mongoose = require('mongoose');
const Files = mongoose.model('Files');
const router = require('express').Router();
const auth = require('../auth');
const fs = require('fs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const secret = require('../../config/passportConfig.json').secret;
const uploadPath = __dirname + '/../../uploads/';

const algorithm = 'aes-256-cbc';

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
        let userPath = uploadPath + decodded.email + decodded.id;
        if (!fs.existsSync(userPath)) {
          fs.mkdirSync(userPath);
        }
        uploadFile.mv(`${uploadPath + '/Temp/' + dateTime + fileName}`, function(err) {
          if (err) {
            console.log(err);

            return res.status(400).send(err);
          }

          const key = crypto.randomBytes(32);
          const iv = crypto.randomBytes(16);

          // console.log(key.toString('hex'));
          File.fileKey = key.toString('hex');
          File.userID = decodded.id;
          File.IV = iv.toString('hex');

          const pathToFile = `${uploadPath + '/Temp/' + dateTime + fileName}`;
          const pathToFileEnc = `${userPath + '/' + dateTime + '_enc_' + fileName}`;
          File.filePath = pathToFileEnc;

          fs.readFile(pathToFile, 'binary', function(err, contents) {
            let hw = encrypt(Buffer.from(contents),key,iv);
            fs.writeFile(pathToFileEnc, hw.encryptedData, 'binary', err => {

              fs.unlink(pathToFile, function(err){});

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

        const directoryPath = req.query.file;
        console.log(directoryPath);

        // Files.findByFilePath(req.query.file,(err,data)=>{
        //    console.log(data)
        //   })
      //  try {
          if (fs.existsSync(directoryPath)) {
            Files.findByFilePath(directoryPath,(err,data)=>{
               console.log("upload path ",uploadPath);
               console.log("File name", data.fileName);
              const pathToFileDec = `${uploadPath + 'DownTemp/' + data.fileName}`;
              console.log("decPath ", pathToFileDec)
              fs.readFile(directoryPath, 'binary', function(err, contents) {
                // hw.encryptedData = contents;
                 decrypt(contents,data.fileKey,data.IV, decrypted => {
                   fs.writeFile(pathToFileDec, decrypted, 'binary', err => {
                     if (err) return console.log(err);
                     console.log('success decrypted');
                     console.log(pathToFileDec);
                     return res.download(pathToFileDec);
                   });
                });

              });
            })
          }
        //} catch (err) {
          //return res.status(400).json({ err: err });
        //}
      }
    });
  } else {
    return res.status(401).json({ err: 'token not found' });
  }
});

function encrypt(text,key,iv) {
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text,key,iv, cb) {
  // let iv = Buffer.from(text.iv, 'hex');
  console.log(iv);
  let encryptedText = Buffer.from(text, 'hex');
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(Buffer.from(key,"hex")), Buffer.from(iv,"hex"));
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return cb(decrypted.toString());
}

module.exports = router;
