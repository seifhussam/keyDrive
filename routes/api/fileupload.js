const router = require('express').Router();
const auth = require('../auth');
const fs = require('fs');

router.post('/', auth.required, (req, res, next) => {
  let uploadFile = req.files.file;
  const fileName = req.files.file.name;
  const dateTime = new Date().getTime();
  uploadFile.mv(`${__dirname}/../../uploads/${dateTime + fileName}`, function(
    err
  ) {
    if (err) {
      console.log(err);

      return res.status(500).send(err);
    }

    res.json({
      file: `${__dirname}/../../uploads/${dateTime + fileName}`
    });
  });
});

router.delete('/', auth.required, (req, res) => {
  const fileName = JSON.parse(req.body).file;
  console.log(fileName);
  fs.unlink(fileName, function(err) {
    if (err) res.status(400).json({ err });
    // if no error, file has been deleted successfully
    console.log('File deleted!');
    res.sendStatus(200);
  });
});

module.exports = router;
