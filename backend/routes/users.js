const routes = require('express').Router();
const crypto = require('crypto');


/**
 * Define route to get all users by using prepared statements. 
 */
routes.get('/api/users', (req, res) => {
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
routes.get('/api/users/:userName', function(req, res) {
    const uname = req.params.userName;
    //const name = req.params.name;
    //const email = this.email;
    const pwd = this.password;
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

routes.post('/api/users', function(req, res){
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

module.exports = routes;

