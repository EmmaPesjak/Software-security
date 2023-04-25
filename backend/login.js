const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

// User input: CONNECT TO FRONTEND grejer
let uname = "admin";  
let pwd = "password' OR 1=1;--";
let hashed_pwd = sha1(pwd);   // Hash value of password.

// Establish a connection to the SQLite database.
let db = new sqlite3.Database('example.db');

// Create a prepared statement to select a user from the database. 
let stmt = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?");

// Bind the user input parameters to the prepared statement.
stmt.bind(uname, pwd, hashed_pwd);

// Execute the prepared statement.
stmt.get(function(err, row) {
  // Check for errors and row count.
  if (err || !row) {
    console.log("User not found");
  } else {
    // RE-DIRECT TO PAGE FOR POSTS
    console.log("User found");
  }
});

// Create hash-pwd.
function sha1(input) {
  const hash = crypto.createHash('sha1');
  hash.update(input);
  return hash.digest('hex');
}

// Finalize the prepared statement.
stmt.finalize();

// Close database.
db.close();