// Include all needed modules
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();


// Import the routes
const postRoutes = require('./routes/posts');
//const userRoutes = require('./routes/users');

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
//app.use('/', userRoutes);

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


// // Closes the connection to the database.
// db.close((err) => {
//     if (err) {
//         return console.error(err.message);
//     }
//     console.log('Close the database connection.');
// });
