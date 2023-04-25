const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');


// User input: CONNECT TO FRONTEND 
let uname = "admin";  // USERNAME FROM LOGIN-PAGE
let pwd = "password' OR 1=1;--";
let email = "tjena";
let fullName = "steffeboy";
let confirmPwd = "confirmedmög";
let hashed_pwd = sha1(pwd);   // Hash value of password.

if (pwd != confirmPwd){
    console.log("Det bidde lide fel här, försök igen")
} else {

    // Function to create a hash of the user's password.
    function hashPassword(password) {
        const hash = crypto.createHash('sha256');
        hash.update(password);
        return hash.digest('hex');
    }
    
    // Open a connection to the database.
    const db = new sqlite3.Database('example.db');
    
    // Define the user object with properties for username and password.
    const user = {
        username: uname,
        password: pwd,
        email: email,
        fullName: fullName,
        hashedPassword: hashed_pwd
    };
    
    // Prepare the insert statement using a placeholder for the hashed password.
    const insertStatement = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    
    // Bind the values to the statement, including the hashed password.
    const hashedPassword = hashPassword(user.password);
    insertStatement.run(user.username, hashedPassword);
    
    // Close the statement and the database connection.
    insertStatement.finalize();
    db.close();
    
}

