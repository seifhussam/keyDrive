const router = require('express').Router();
const auth = require('../auth');
const fs = require('fs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const secret = require('../../config/passportConfig.json').secret;

const uploadPath = __dirname + '/../../uploads/';

const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

router.post('/', auth.required, (req, res, next) => {
  let uploadFile = req.files.file;
  // console.log(uploadFile);
  const fileName = req.files.file.name;
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

          var pathToFile = `${uploadPath + '/Temp/' + dateTime + fileName}`;
          var pathToFileEnc = `${userPath + '/' + dateTime + '_enc_omar____seif_' + fileName}`;

          fs.readFile(pathToFile, 'binary', function(err, contents) {
            let hw = encrypt(Buffer.from(contents));
            fs.writeFile(pathToFileEnc, hw.encryptedData, 'binary', err => {
            });
         });


         fs.unlink(pathToFile, function(err){});


         // var pathToFileDec = `${userPath + '/' + dateTime + '_dec_' + fileName}`;
         // fs.readFile(pathToFileEnc, 'binary', function(err, contents) {
         //   hw.encryptedData = contents;
         //   let decrypted = decrypt(hw);
         //   fs.writeFile(pathToFileDec, decrypted, 'binary', err => {
         //     if (err) console.log(err);
         //     console.log('success');
         //   });
         // });


          return res.json({
            file: `${userPath + '/' + dateTime + fileName}`
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
        fs.readdir(directoryPath, function(err, files) {
          //handling error
          if (err) {
            return res.status(401).json({ err: 'something bad happen' });
          }

          return res.status(200).json(files);
        });
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
    res.sendStatus(200);
  });
});

router.delete('/delete', auth.required, (req, res) => {
  if (req.cookies.token) {
    jwt.verify(req.cookies.token, secret, (err, decodded) => {
      if (err) {
        console.log(err);
        return res.status(401).send(err);
      } else {
        const directoryPath =
          uploadPath + decodded.email + decodded.id + '/' + req.query.file;

        fs.unlink(directoryPath, function(err) {
          if (err) res.status(400).json({ err });
          // if no error, file has been deleted successfully
          console.log('File deleted!');
          res.sendStatus(200);
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

function encrypt(text) {
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text) {
  let iv = Buffer.from(text.iv, 'hex');
  let encryptedText = Buffer.from(text.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = router;
