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

routes.post('/api/posts', function(req, res){
    const { user, content, likes, dislikes} = req.body;

    // ADD COLUMNS TO DB: LIKES & DISLIKES
    // Define the SQL query to insert a new user
    const sql = 'INSERT INTO post (user, content, likes, dislikes) VALUES (?, ?, ?, ?)';

    // Prepare the SQL statement
    const stmt = db.prepare(sql);

    // Bind the post data to the prepared statement
    stmt.bind(user, content, likes, dislikes);

    // Execute the prepared statement and return the ID of the inserted post
    stmt.run(function (error) {
        if (error) throw error;
        res.json({ id: this.lastID });
  });

})

module.exports = routes;