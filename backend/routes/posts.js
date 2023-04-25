const routes = require('express').Router();

/**
 * Define route to get all users by using prepared statements. 
 */
routes.get('/api/posts', (req, res) => {
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
routes.post('/api/posts', (req, res) => {
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
routes.delete('/api/posts/:id', (req, res) => {
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
  routes.patch('/api/posts/:postId', (req, res) => {
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

module.exports = routes;