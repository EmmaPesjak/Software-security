const jwt = require('jsonwebtoken');
const fs = require('fs');

// Retrieve keys from files.
const privateKey = fs.readFileSync('./private.key', 'utf8');
const publicKey = fs.readFileSync('./public.key', 'utf8');

/**
 * Generate a token with the private key and RS256 algorithm.
 * @param {*} username username.  #TODO Make the entire user payload.
 * @returns token.
 */
function createToken(username){
  return jwt.sign({ username: username }, privateKey, { algorithm: 'RS256'});
}

/**
 * Verify token.
 * @param {*} token token.
 * @returns whether it is verified or not.
 */
function verifyToken(token){
  return jwt.verify(token, publicKey, { algorithms: ['RS256'] });
}

module.exports = {createToken, verifyToken};
