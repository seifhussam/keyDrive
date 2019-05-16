const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const http = require('http');
const fileUpload = require('express-fileupload');
const crypto = require('crypto');

const secret = require('./config/passportConfig.json').secret;
let dbconfig = require('./config/db.json').db;

mongoose.promise = global.Promise;

let app = express();
let server = http.Server(app);
const PORT = process.env.PORT || 8000;

app.use(cors({ credentials: true }));

const algorithm = 'aes-256-ctr';
const symmetricKey = 'Symetric';

const decrypt_middleware = (req, res, next) => {
  if (Object.getOwnPropertyNames(req.body).length > 0) {
    console.log(req.body);

    const decipher = crypto.createDecipher(algorithm, symmetricKey);
    let dec = decipher.update(req.body.enc, 'hex', 'utf8');
    dec += decipher.final('utf8');
    req.body = JSON.parse(dec);
    console.log(req.body);
  }

  if (res.send) {
    var oldWrite = res.write,
      oldEnd = res.end;

    var chunks = [];

    res.write = function(chunk) {
      chunks.push(chunk);

      oldWrite.apply(res, arguments);
    };

    res.end = function(chunk) {
      if (chunk) chunks.push(chunk);

      var body = Buffer.concat(chunks).toString('utf8');
      // console.log(req.path, body);

      oldEnd.apply(res, arguments);
    };
  }
  next();
};
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(decrypt_middleware);
app.use(cookieParser());
app.use(fileUpload());

app.use(bodyParser.json({ limit: '5mb' }));
app.use(
  session({
    secret: secret,
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false
  })
);

mongoose.connect(dbconfig, { useNewUrlParser: true }).catch(err => {
  console.log('db err', err);
});

mongoose.set('debug', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

require('./models/Users');
require('./models/Files');

require('./config/passport');
app.use(require('./routes'));

app.use(express.static(path.join(__dirname, '/client/build')));

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/client/build/index.html');
});

server.listen(PORT, () =>
  console.log('Server running on http://localhost:' + PORT + '/')
);

app.use(function(err, req, res, next) {
  if (err) {
    res.status(err.status || 500);
    console.log(err);

    res.json({
      errors: {
        message: err.message
      }
    });
  }
});

const ngrok = require('ngrok');
const nodemailer = require('nodemailer');
const emailConfig = require('./config/email.json');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailConfig.email,
    pass: emailConfig.password
  }
});

ngrok
  .connect(PORT)
  .then(url => {
    console.log(url);

    const mailOptions = {
      from: 'keydrive33@gmail.com', // sender address
      to: 'seif.hussam.96@gmail.com,3omaralshazly@gmail.com', // list of receivers
      subject: 'ngrok link', // Subject line
      html: '<p>Your link for ngrok is ' + url + '</p>' // plain text body
    };
    transporter.sendMail(mailOptions, function(err, info) {
      if (err) console.log(err);
      else console.log(info);
    });
  })
  .catch(err => {
    console.log(err);
  });
