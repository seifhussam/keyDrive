const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');
const crypto = require('crypto');

//POST new user route (optional, everyone has access)
router.post('/', auth.optional, (req, res, next) => {
  const {
    body: { user }
  } = req;

  if (!user) {
    return res.status(422).json({
      errors: {
        user: 'is required'
      }
    });
  }

  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required'
      }
    });
  }

  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required'
      }
    });
  }
  const strongRegex = new RegExp(
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'
  );

  if (!strongRegex.test(user.password)) {
    return res.status(422).json({
      errors: {
        password: 'Password is not strong enough'
      }
    });
  }

  const finalUser = new Users(user);

  finalUser.setPassword(user.password);

  return finalUser
    .save()
    .then(() => res.json({ user: finalUser.toAuthJSON() }))
    .catch(err => {
      console.log(err);

      return res.status(422).json({ msg: 'something went wrong!' });
    });
});

//POST login route (optional, everyone has access)
router.post('/login', auth.optional, (req, res, next) => {
  const {
    body: { user }
  } = req;

  const symmetricKey = 'Symetric';

  if (!user) {
    return res.status(422).json({
      errors: {
        user: 'is required'
      }
    });
  }

  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required'
      }
    });
  }
  // else {
  //   var decipher = crypto.createDecipher('aes-256-ctr', symmetricKey);
  //   var dec = decipher.update(user.email, 'hex', 'utf8');
  //   dec += decipher.final('utf8');
  //   user.email = dec;
  // }

  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required'
      }
    });
  }

  // else {
  //   var decipher = crypto.createDecipher('aes-256-ctr', symmetricKey);
  //   var dec = decipher.update(user.password, 'hex', 'utf8');
  //   dec += decipher.final('utf8');
  //   user.password = dec;
  // }

  return passport.authenticate(
    'local',
    { session: false },
    (err, passportUser, info) => {
      if (err) {
        return next(err);
      }

      if (passportUser) {
        const user = passportUser;
        user.token = passportUser.generateJWT();

        return res
          .cookie('token', user.token)
          .json({ user: user.toAuthJSON() });
      }
      return res.status(400).json(info);
    }
  )(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required, (req, res, next) => {
  const {
    payload: { id }
  } = req;

  if (!req.payload || !req.payload.id) {
    return res.status(422).json({
      errors: {
        user: 'is not logged in'
      }
    });
  }
  return Users.findById(id).then(user => {
    if (!user) {
      return res.sendStatus(400);
    }

    return res.json({ user: user.toAuthJSON() });
  });
});

module.exports = router;
