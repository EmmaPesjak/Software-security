module.exports = function(db, app, sessionIds) {
  //* GET
  /**
   * Retrieves all posts.
   */
  app.get('/api/users/:userName/posts', (req, res) => {
    const userName = req.params.userName;

    console.log(req.cookies.ID);
    console.log(sessionIds.get(userName));
    if (!req.body.debug && (!sessionIds.has(userName) || req.cookies.ID !== sessionIds.get(userName))) return res.status(401).json({"error": "No active session."});

    // The SQL query to retrieve all posts..
    const sql = `
    SELECT p.*, u.name,
    (SELECT DISTINCT COUNT(l.user) FROM like AS l WHERE l.post = p.postId) AS likes,
    (SELECT DISTINCT COUNT(d.user) FROM dislike AS d WHERE d.post = p.postId) AS dislikes
    FROM post AS p, user AS u
    WHERE p.user = u.userId
    `;

    // Prepares the SQL statement.
    const stmt = db.prepare(sql);

    // Executes the prepared statement and returns the result.
    stmt.all(function(err, rows) {
      if (err) {
        console.error(err.message);
        res.status(500).json({"error": "Internal Server Error."});
      } else {
        res.status(200).json(rows);
      }
    });

    // Finalizes the prepared statement to release its resources.
    stmt.finalize();
  });

  //* GET
  /**
   * Retrieves the specified post.
   */
  app.get('/api/posts/:postId', (req, res) => {
    const postId = req.params.postId;

    // The SQL query to retrieve the specified user.
    //const sql = 'SELECT p.*, u.name FROM post AS p, user AS u WHERE postId = ? AND p.user = u.userId'

    // Join likes and dislikes with post.
    const sql = `SELECT p.*, u.name,
    COUNT(DISTINCT like.user) AS likes,
    COUNT(DISTINCT dislike.user) AS dislikes
    FROM post AS p
    JOIN user AS u ON p.user = u.userId
    LEFT JOIN like ON p.postId = like.post
    LEFT JOIN dislike ON p.postId = dislike.post
    WHERE p.postId = ?
    GROUP BY p.postId
    `;

    //const sql = 'SELECT * FROM post WHERE postId = ?';

    // Prepares the SQL statement.
    let stmt = db.prepare(sql);

    // Binds the parameters to the prepared statement.
    stmt.bind(postId);

    // Executes the prepared statement and returns the result.
    stmt.get((err, row) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({"error": "Internal Server Error."});
      } else if (!row) {
        res.status(404).send('Post not found');
      } else {
        res.status(200).json(row);
      }
    });

    // Finalizes the prepared statement to release its resources.
    stmt.finalize();
  });

  //* POST
  /**
   * Creates a post.
   */
  app.post('/api/posts', (req, res) => {
    const {content, user} = req.body;

    // Make sure that user exists.
    const sql = `
    INSERT INTO post(content, user)
    SELECT ?, ?
    WHERE EXISTS(SELECT userId FROM user WHERE userId = ?)
    RETURNING *
    `;

    // Prepares the SQL statement.
    const stmt = db.prepare(sql);

    // Binds the parameters to the prepared statement.
    stmt.bind(content, user, user);

    // Executes the prepared statement and returns the result.
    stmt.get(function(err, result) {
      if (err) {
        console.error(err.message);
        res.status(500).json({"error": "Internal Server Error."});
      } else if (this.changes === 0) {
        res.status(400).send('User with specified ID does not exist');
      } else {
        res.status(201).send(result);
      }
    });

    stmt.finalize();
  });

  //* POST
  /**
   * Likes the specified post.
   */
  app.post('/api/posts/like/:postId', (req, res) => {
    const postId = req.params.postId,
    user = req.body.user;

    // Make sure that post and user exists.
    const sql = `
    INSERT INTO like(post, user)
    SELECT ?, ?
    WHERE EXISTS(SELECT postId FROM post WHERE postId = ?) AND EXISTS(SELECT userId FROM user WHERE userId = ?)
    `;

    const stmt = db.prepare(sql);

    stmt.bind(postId, user, postId, user);

    // Executes the prepared statement and returns the result.
    stmt.run(function(err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({"error": "Internal Server Error."});
      } else if (this.changes === 0) {
        res.status(400).send('User or post with specified ID does not exist');
      } else {
        res.status(201).send('Like record created successfully');
      }
    });

    // Finalizes the prepared statement to release its resources.
    stmt.finalize();
  });

  //* POST
  /**
   * Dislikes the specified post.
   */
  app.post('/api/posts/dislike/:postId', (req, res) => {
    const postId = req.params.postId,
    user = req.body.user;

    // Make sure that post and user exists.
    const sql = `
    INSERT INTO dislike(post, user)
    SELECT ?, ?
    WHERE EXISTS(SELECT postId FROM post WHERE postId = ?) AND EXISTS(SELECT userId FROM user WHERE userId = ?)
    `;

    const stmt = db.prepare(sql);
    stmt.bind(postId, user, postId, user);

    // Executes the prepared statement and returns the result.
    stmt.run(function(err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({"error": "Internal Server Error."});
      } else if (this.changes === 0) {
        res.status(400).send('User or post with specified ID does not exist');
      } else {
        res.status(201).send('Like record created successfully');
      }
    });

    // Finalizes the prepared statement to release its resources.
    stmt.finalize();
  });

  //* PATCH
  /**
   * Updates the specified post.
   */
  app.patch('/api/posts/:postId', (req, res) => {
    const postId = req.params.postId,
    {content, user} = req.body;

    // The SQL query to update the specified post.
    const sql = 'UPDATE post SET content = ? WHERE postId = ?';

    // Prepares the SQL statement.
    const stmt = db.prepare(sql);

    // Binds the parameters to the prepared statement.
    stmt.bind(content, postId);

    // Executes the prepared statement and returns the result.
    stmt.run(function(err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({"error": "Internal Server Error."});
      } else if (this.changes === 0) {
        res.status(404).send('Post with specified ID not found');
      } else {
        res.status(200).send('Post updated successfully');
      }
    });

    // Finalizes the prepared statement to release its resources.
    stmt.finalize();
  });

  //* DELETE
  /**
   * Deletes the specified post.
   */
  app.delete('/api/posts/:id', (req, res) => {
    const postId = req.params.id;

    // The SQL query to delete the specified post.
    const sql = 'DELETE FROM post WHERE postId = ?';

    // Prepares the SQL statement.
    const stmt = db.prepare(sql);

    // Binds the parameters to the prepared statement.
    stmt.bind(postId);

    // Executes the prepared statement and returns the result.
    stmt.run(function(err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({"error": "Internal Server Error."});
      } else if (this.changes === 0) {
        res.status(404).send('Post with specified ID not found');
      } else {
        res.status(204).send({id: this.lastID});
      }
    });

    // Finalizes the prepared statement to release its resources.
    stmt.finalize();
  });

  /**
   * Deletes the specified like.
   */
  app.delete('/api/posts/like/:postId', (req, res) => {
    const postId = req.params.postId,
    user = req.body.user;

    // Make sure that user and post exists.
    const sql = `
    DELETE FROM like
    WHERE user = ? AND post = ?
    AND EXISTS(SELECT userId FROM user WHERE userId = ?)
    AND EXISTS(SELECT postId FROM post WHERE postId = ?)
    `;

    const stmt = db.prepare(sql);

    stmt.bind(user, postId, user, postId);

    stmt.run(function(err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({"error": "Internal Server Error."});
      } else if (this.changes === 0) {
        res.status(404).send('Like with specified user and post not found');
      } else {
        res.status(204).send('Like deleted successfully');
      }
    });

    // Finalizes the prepared statement to release its resources.
    stmt.finalize();
  });

  /**
   * Deletes the specified dislike.
   */
  app.delete('/api/posts/dislike/:postId', (req, res) => {
    const postId = req.params.postId,
    user = req.body.user;

    // Make sure that user and post exists.
    const sql = `DELETE FROM dislike
    WHERE user = ? AND post = ?
    AND EXISTS(SELECT userId FROM user WHERE userId = ?)
    AND EXISTS(SELECT postId FROM post WHERE postId = ?)
    `;

    // Prepares the SQL statement.
    const stmt = db.prepare(sql);

    // Binds the parameters to the prepared statement.
    stmt.bind(postId, user);

    // Executes the prepared statement and returns the result.
    stmt.run(function(err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({"error": "Internal Server Error."});
      } else if (this.changes === 0) {
        res.status(404).send('Dislike with specified user and post not found');
      } else {
        res.status(204).send('Like deleted successfully');
      }
    });

    // Finalizes the prepared statement to release its resources.
    stmt.finalize();
  });
}
