const routes = require('express').Router();

/**
 * Define route to get all users by using prepared statements. 
 */
routes.get('/api/posts', (req, res) => {
    // Define the SQL query to retrieve all users
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

module.exports = routes;