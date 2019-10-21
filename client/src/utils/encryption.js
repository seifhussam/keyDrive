import crypto from 'crypto';
const algorithm = 'aes-256-ctr';

const decrypt = () => {};

const aes_encrypt = (value, key) => {
  const cipher = crypto.createCipher(algorithm, key);
  let crypted = cipher.update(value, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
};

module.exports.aes_encrypt = aes_encrypt;
module.exports.decrypt = decrypt;
