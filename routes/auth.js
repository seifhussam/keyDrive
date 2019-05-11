const jwt = require('express-jwt');
const secret = require('../config/passportConfig.json');

const getTokenFromHeaders = req => {
  const {
    headers: { authorization }
  } = req;

  if (req.cookies.token) {
    return req.cookies.token;
  }

  if (authorization && authorization.split(' ')[0] === 'Token') {
    return authorization.split(' ')[1];
  }
  if (authorization && authorization.split(' ')[2] === 'Token') {
    return authorization.split(' ')[3];
  }

  return null;
};
const auth = {
  required: jwt({
    ...secret,
    userProperty: 'payload',
    getToken: getTokenFromHeaders
  }),
  optional: jwt({
    ...secret,
    userProperty: 'payload',
    getToken: getTokenFromHeaders,
    credentialsRequired: false
  })
};

module.exports = auth;
