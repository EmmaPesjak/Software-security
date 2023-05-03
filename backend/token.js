const crypto = require('crypto'),
jwt = require('jsonwebtoken');



const secretKey = crypto.randomBytes(64).toString('hex');

// Create token with payload (user-info), sign it together with the secret key,
// and return it as a token.
function createToken(payload) {
  return jwt.sign(payload, secretKey);
}

// Verify token by authenticate it with the secret key.
function verifyToken(token) {
  return jwt.verify(token, secretKey);
}

module.exports = {createToken, verifyToken};
