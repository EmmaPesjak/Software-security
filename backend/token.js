/*const jwt = require('jsonwebtoken');
const fs = require('fs');
const NodeRSA = require('node-rsa');

// Generate a new 2048-bit key pair for each user
function generateKeyPair() {
  //const key = new NodeRSA({b: 2048});
  //const privateKey = key.exportKey('pkcs1-private-pem');
  //const publicKey = key.exportKey('pkcs8-public-pem');
  const publicKey = "public";
  const privateKey = "private";
  return { privateKey, publicKey };
}

// Example usage:
const { privateKey, publicKey } = generateKeyPair();

// Save the private key to a file (in a secure location)
//fs.writeFileSync('private.key', privateKey);

function createToken(username){
  return jwt.sign({ username: username }, publicKey);
  //return jwt.sign({ username: username }, publicKey, { algorithm: 'RS256' });
}

function verifyToken(token){
  return jwt.verify(token, privateKey);
}

// Save the public key to a database or use it to create a JWT token for the user
//const token = jwt.sign({ username: 'example' }, publicKey, { algorithm: 'RS256' });

// Verify the token with the private key
//const decoded = jwt.verify(token, privateKey);


module.exports = {createToken, verifyToken};*/


/*const crypto = require('crypto'),
jwt = require('jsonwebtoken'),
fs = require('fs'),
NodeRSA = require('node-rsa');
key = new NodeRSA({b: 2048}); // Generate a new 2048-bit key pair

const RSA_PRIVATE_KEY = fs.readFileSync('private.key');
const RSA_PUBLIC_KEY = fs.readFileSync('public.key');

// Create token with payload (user-info), sign it together with the secret key,
// and return it as a token.
function createToken(username) {
  const jwtBearerToken = jwt.sign({}, RSA_PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: 120,
    subject: username
  })
  return jwtBearerToken;
}

//const checkIfAuthenticated = expressJwt({
//  secret: RSA_PUBLIC_KEY
//}); 

// Verify token by authenticate it with the secret key.
function verifyToken(token) {
  return jwt.verify(token, RSA_PUBLIC_KEY, { algorithm: 'RS256' });
}*/

const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync('./private.key', 'utf8');
const publicKey = fs.readFileSync('./public.key', 'utf8');

// Create a token
//const token = jwt.sign({ username: 'john.doe' }, 'secret');

function createToken(username){
  return jwt.sign({ username: username }, privateKey, { algorithm: 'RS256'});
}

function verifyToken(token){
  return jwt.verify(token, publicKey, { algorithms: ['RS256'] });
}

// Verify a token
/*try {
  const decoded = jwt.verify(token, 'secret');
  console.log(decoded); // { username: 'john.doe', iat: 1620261726 }
} catch (err) {
  console.error(err);
}*/


module.exports = {createToken, verifyToken};
