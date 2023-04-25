// Include all needed modules
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

// ADDED CRYPTO
const crypto = require('crypto');


// Import the routes
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');

// Create an Express application
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Opens a connection to the database.
const db = new sqlite3.Database('./guestbook.db', (err) => {
    if (err) return console.error(err.message);
    console.log('Connected to the in-memory SQlite database.');
});
// The DB consists of two tables: user(userId, username, hashedPassword, name, email) and post(postId, content, user).
// Note that the DB doesn't contain any data at this time.
// Tutorial on how to query data from the DB: https://www.sqlitetutorial.net/sqlite-nodejs/query/.

// Define the port the server will accept connections on
const port = process.env.PORT || 3000;

// Start the server
app.listen(port, function() {
    console.log(`Server is running on port ${port}`);
});

// Enable the routes in app
app.use('/', postRoutes);
app.use('/', userRoutes);



//////////// USERS 


/**
 * Define route to get all users by using prepared statements. 
 */
app.get('/api/users', (req, res) => {
    // Define the SQL query to retrieve all users
    const sql = 'SELECT * FROM user';

    // Prepare the SQL statement
    const stmt = db.prepare(sql);

    // Execute the prepared statement and return the result as a JSON array
    stmt.all([], (error, req) => {
        if (error) throw error;
        res.json(req);
    });

    // Finalize the prepared statement to release its resources
    stmt.finalize();
});

/**
 * Get all info about specific user by binding info with prepared statements. 
 */
app.get('/api/users/:user', function(req, res) {
    const uname = req.params.userName;
    //const name = req.params.name;
    //const email = this.email;
    const pwd = req.params.password;
    const hashed_pwd = sha256(pwd);

    const sql = "SELECT * FROM user WHERE username = ? AND hashedPassword = ?"

    // Create a prepared statement to select a user from the database. 
    let stmt = routes.prepare(sql);

    // Bind the user input parameters to the prepared statement.
    stmt.bind(uname, hashed_pwd);

    // Execute the prepared statement.
    stmt.get((err, row) => {
        if (err) throw err;
        res.json(row);
    });
    
    // Finalize the prepared statement.
    stmt.finalize();

});



app.post('/api/users', function(req, res){
    const { name, userName, email, password} = req.body;
    const hashedPassword = sha256(password);

    // Define the SQL query to insert a new user
    const sql = 'INSERT INTO user (username, hashedPassword, name, email) VALUES (?, ?, ?, ?)';

    // Prepare the SQL statement
    const stmt = db.prepare(sql);

    // Bind the user data to the prepared statement
    stmt.bind(userName, hashedPassword, name, email);

    // Execute the prepared statement and return the ID of the inserted user
    stmt.run(function (error) {
        if (error) throw error;
        res.json({ id: this.lastID });
  });

})


// Get hash-password.
function sha256(input) {
    const hash = crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
  }


// // Closes the connection to the database.
// db.close((err) => {
//     if (err) {
//         return console.error(err.message);
//     }
//     console.log('Close the database connection.');
// });
