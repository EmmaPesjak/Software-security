// Include all needed modules
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

// ADDED CRYPTO
const crypto = require('crypto');


// Import the routes
//const postRoutes = require('./routes/posts');
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
//app.use('/', postRoutes);
//app.use('/', userRoutes);



////////////////////////// USERS ////////////////////////// 


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
app.get('/api/users/:userName', (req, res) => {

    const userName = req.params.userName;
    const password = req.body.password;
    const hashedPwd = sha256(password);

    const sql = 'SELECT * FROM user WHERE username = ? AND hashedPassword = ?'

    // Create a prepared statement to select a user from the database. 
    let stmt = db.prepare(sql);

    // Bind the user input parameters to the prepared statement.
    stmt.bind(userName, hashedPwd);

    // Execute the prepared statement.
    stmt.get((err, row) => {
        if (err) throw err;
        res.json(row);
    });
    
    // Finalize the prepared statement.
    stmt.finalize();

});


/**
 * Add a new user.
 */
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
    stmt.run(function (error, row) {
        if (error) throw error;
        res.json(row);
    });
    // Finalize the prepared statement.
    stmt.finalize();

})


// Get hash-password.
function sha256(input) {
    const hash = crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
}



////////////////////////// POSTS ////////////////////////// 


/**
 * Define route to get all users by using prepared statements. 
 */
app.get('/api/posts', (req, res) => {
    // Define the SQL query to retrieve all posts.
    const sql = 'SELECT * FROM post';

    // Prepare the SQL statement
    const stmt = db.prepare(sql);

    // Execute the prepared statement and return the result as a JSON array
    stmt.all([],(error, req) => {
        if (error) throw error;
        res.json(req);
    });

    // Finalize the prepared statement to release its resources
    stmt.finalize();
});


/**
 * Add a new post.
 */
app.post('/api/posts', (req, res) => {
    const { content, user, likes, dislikes} = req.body;

    const sql = 'INSERT INTO post (content, user, likes, dislikes) VALUES (?, ?, ?, ?)';

    // Prepare the SQL statement
    const stmt = db.prepare(sql);

    // Bind the parameters to the prepared statement
    stmt.bind(content, user, likes, dislikes);

    // Execute the prepared statement and return the ID of the inserted user
    stmt.run(function (error) {
        if (error) throw error;
        res.json({ id: this.lastID });
    });
    // Finalize the prepared statement.
    stmt.finalize();
});



/**
 * Define route to delete a post by ID using prepared statements.
 */
app.delete('/api/posts/:id', (req, res) => {
    const postId = req.params.id;
  
    // Define the SQL query to delete the post with the specified ID
    const sql = 'DELETE FROM post WHERE postId = ?';
  
    // Prepare the SQL statement
    const stmt = db.prepare(sql);
  
    // Bind the post ID parameter to the prepared statement
    stmt.bind(postId);
  
    // Execute the prepared statement
    stmt.run( (error) => {
      if (error) {
        console.error(error.message);
        res.status(500).send('Internal server error');
      } else {
        res.status(204).send({id: this.lastID});
      }
    });
  
    // Finalize the prepared statement to release its resources
    stmt.finalize();
  });

  /**
   * Update a post (edit, likes, or dislikes)
   */
  app.patch('/api/posts/:postId', (req, res) => {
    const postId = req.params.postId;
    const { content, user, likes, dislikes } = req.body;
  
    const sql = `
      UPDATE post
      SET content = ?,
          likes = ?,
          dislikes = ?
      WHERE postId = ?
    `;

    // Prepare the SQL statement
    const stmt = db.prepare(sql);

    // Bind the post ID parameter to the prepared statement
    stmt.bind(content, likes, dislikes, postId);
  
    // Execute the prepared statement
    stmt.run( (error) => {
        if (error) {
          console.error(error.message);
          res.status(500).send('Internal server error');
        } else {
          res.status(204).send({id: this.lastID});
        }
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
