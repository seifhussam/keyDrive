const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const http = require('http');
const fileUpload = require('express-fileupload');

const secret = require('./config/passportConfig.json').secret;
let dbconfig = require('./config/db.json').db;

mongoose.promise = global.Promise;

let app = express();
let server = http.Server(app);
const PORT = process.env.PORT || 8000;

app.use(cors({ credentials: true }));

app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(cookieParser());
app.use(fileUpload());
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
require('./config/passport');
app.use(require('./routes'));

// app.use(express.static(path.join(__dirname, '/client/build')));

// app.get('*', (req, res) => {
//   res.sendFile(__dirname + '/client/build/index.html');
// });

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