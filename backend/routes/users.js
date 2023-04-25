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
routes.get('/api/users/:userName', (req, res) => {

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

module.exports = routes;

