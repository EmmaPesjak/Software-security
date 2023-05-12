
module.exports = function(db, app, createToken, verifyToken, sessionIds, csrfTokens, limiter, body, validationResult) {

  /**
   * Retrieve all posts.
   */
  app.get('/api/users/:username/posts', (req, res) => {
    
    // Validate user and session.
    const validation = validateRequest(req);
    if (!validation.valid) {
      res.status(validation.status).json(validation.message);
      return;
    }

    // The SQL query to retrieve all posts..
    const sql = `
    SELECT p.*, u.username, u.name,
    (SELECT COUNT(l.user) FROM like AS l WHERE l.post = p.postId) AS likes,
    (SELECT COUNT(d.user) FROM dislike AS d WHERE d.post = p.postId) AS dislikes,
    CASE WHEN (SELECT l.user FROM like AS l WHERE l.post = p.postId AND l.user = u.userId) IS NULL
      THEN 0
      ELSE 1
    END AS likedByUser,
    CASE WHEN (SELECT d.user FROM dislike AS d WHERE d.post = p.postId AND d.user = u.userId) IS NULL
      THEN 0
      ELSE 1
    END AS dislikedByUser
    FROM post AS p, user AS u
    WHERE p.user = u.userId
    `;

    // Prepares the SQL statement.
    const stmt = db.prepare(sql);

    // Executes the prepared statement and returns the result.
    stmt.all((err, rows) => {
      // Finalizes the prepared statement to release its resources.
      stmt.finalize();

      if (err) {
        console.error(err.message);
        res.status(500).json('Internal Server Error.');
      } else {
        res.status(200).json(rows);
      }
    });

  });

  
  /**
   * Retrieves the specified post.   #TODO ANVÄNDS DENNA????????? TA BORT?
   */
  app.get('/api/posts/:postId', (req, res) => {
    const postId = req.params.postId;

    // The SQL query to retrieve the specified post. Join username, likes, and dislikes with post.
    const sql = `SELECT p.*, u.username, u.name,
    COUNT(DISTINCT like.user) AS likes,
    COUNT(DISTINCT dislike.user) AS dislikes
    FROM post AS p
    JOIN user AS u ON p.user = u.userId
    LEFT JOIN like ON p.postId = like.post
    LEFT JOIN dislike ON p.postId = dislike.post
    WHERE p.postId = ?
    GROUP BY p.postId
    `;

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


  /**
   * Create a post, by first sanitizing the content. 
   */
  app.post('/api/posts', limiter, [
    body('content').trim().escape()
  ], (req, res) => {

    // Catch potential <html> and javascript code.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Validates session and user.
    const validation = validateRequest(req);
    if (!validation.valid) {
      res.status(validation.status).json(validation.message);
      return;
    }

    // Get validated content and username.
    const {content} = req.body;
    const username = validation.username;

    // Make sure that user exists and connect the post to the userID.
    const sql = `
    INSERT INTO post(content, user)
    SELECT ?, (SELECT userId FROM user WHERE username = ?)
    WHERE EXISTS(SELECT userId FROM user WHERE username = ?)
    RETURNING *
    `;

    // Prepares the SQL statement.
    const stmt = db.prepare(sql);

    // Binds the parameters to the prepared statement.
    stmt.bind(content, username, username);

    // Executes the prepared statement and returns the result.
    stmt.get((err, result) => {
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


  /**
   * Likes the specified post.
   */
  app.post('/api/posts/like/:postId', (req, res) => {

    // Validates session and user.
    const validation = validateRequest(req);
    if (!validation.valid) {
      res.status(validation.status).json(validation.message);
      return;
    }

    // Retrieve values from param and body. 
    const postId = req.params.postId,
    userId = req.body.userId;

    // If user has disliked the post previously, delete dislike.
    const deleteDislike = db.prepare('DELETE FROM dislike WHERE post = ? AND user = ?');
    deleteDislike.bind(postId, userId);

    deleteDislike.run((err) => {
      if (err) res.status(500).json('Internal Server Error.');
    });

    deleteDislike.finalize();

    // Find the "like" in the database (if user has previously liked it).
    const selectLike = db.prepare('SELECT d.user FROM like AS d WHERE d.post = ? AND d.user = ?');
    selectLike.bind(postId, userId);

    selectLike.get((err, row) => {
      if (err) res.status(500).json('Internal Server Error.');
      else if (row === undefined) {
        // If no result, insert the new like. 
        const insertLike = db.prepare('INSERT INTO like(post, user) VALUES (?, ?)');
        insertLike.bind(postId, userId);

        insertLike.run((err) => {
          if (err) res.status(500).json('Internal Server Error.');
          else {
            res.status(201).send();
          }
        });

        insertLike.finalize();
      } else {
        // If a "like" was found, delete it to unlike the post. 
        const deleteLike = db.prepare('DELETE FROM like WHERE post = ? AND user = ?');
        deleteLike.bind(postId, userId);

        deleteLike.run((err) => {
          if (err) res.status(500).json('Internal Server Error.');
          else {
            res.status(200).send();
          }
        });

        deleteLike.finalize();
      }
    });

    selectLike.finalize();
  });

  /**
   * Dislikes the specified post.
   */
  app.post('/api/posts/dislike/:postId', (req, res) => {

    // Validates session and user.
    const validation = validateRequest(req);
    if (!validation.valid) {
      res.status(validation.status).json(validation.message);
      return;
    }

    // Get values onces authenticated. 
    const postId = req.params.postId,
    userId = req.body.userId;

   // If user has liked the post previously, delete like.
    const deleteLike = db.prepare('DELETE FROM like WHERE post = ? AND user = ?');
    deleteLike.bind(postId, userId);

    deleteLike.run((err) => {
      if (err) res.status(500).json('Internal Server Error.');
    });

    deleteLike.finalize();

    // Find the "dislike" in the database (if user has previously disliked it).
    const selectDislike = db.prepare('SELECT d.user FROM dislike AS d WHERE d.post = ? AND d.user = ?');
    selectDislike.bind(postId, userId);

    selectDislike.get((err, row) => {
      if (err) res.status(500).json('Internal Server Error.');
      else if (row === undefined) {

        // If no result, insert the new dislike. 
        const insertDislike = db.prepare('INSERT INTO dislike(post, user) VALUES (?, ?)');
        insertDislike.bind(postId, userId);

        insertDislike.run((err) => {
          if (err) res.status(500).json('Internal Server Error.');
          else {
            res.status(201).send();
          }
        });

        insertDislike.finalize();
      } else {
        
        // If a "dislike" was found, delete it.
        const deleteDislike = db.prepare('DELETE FROM dislike WHERE post = ? AND user = ?');
        deleteDislike.bind(postId, userId);

        deleteDislike.run((err) => {
          if (err) res.status(500).json('Internal Server Error.');
          else {
            res.status(200).send();
          }
        });

        deleteDislike.finalize();
      }
    });

    selectDislike.finalize();
  });

  /**
   * Updates the specified post, by first sanitizing the content.
   */
  app.patch('/api/posts/:postId', limiter,[
      body('content').trim().escape()
    ], 
    (req, res) => {

    // Catch potential <html> and javascript code.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Validates session and user.
    const validation = validateRequest(req);
    if (!validation.valid) {
      res.status(validation.status).json(validation.message);
      return;
    }
    
    // Get values once authenticated.
    const postId = req.params.postId,
    userId = Number(req.cookies.userid),
    content = req.body.content;

    // The SQL query to update the specified post.
    const sql = 'UPDATE post SET content = ? WHERE postId = ? AND user = ?';

    // Prepares the SQL statement.
    const stmt = db.prepare(sql);

    // Binds the parameters to the prepared statement.
    stmt.bind(content, postId, userId);

    // Executes the prepared statement and returns the result.
    stmt.run(function(err) {
      if (err) {
        console.error(err.message);
        res.status(500).json({"error": "Internal Server Error."});
      } else if (this.changes === 0) {
        res.status(404).send('Post with specified ID not found');
      } else {
        res.status(200).send();
      }
    });

    // Finalizes the prepared statement to release its resources.
    stmt.finalize();
  });

  /**
   * Deletes the specified post.
   */
  app.delete('/api/posts/:id', limiter, (req, res) => {
    
    // Validates session and user.
    const validation = validateRequest(req);
    if (!validation.valid) {
      res.status(validation.status).json(validation.message);
      return;
    }

    // Retrieve values once authenticated.
    const postId = req.params.id,
    userId = Number(req.cookies.userid),
    username = validation.username;

    // First, find user that belongs to the post.
    const userSql = 'SELECT user FROM post WHERE postId = ?'
    const userStmt = db.prepare(userSql);
    userStmt.bind(postId);

    userStmt.get((err, row) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({"error": "Internal Server Error."});
      } else {
        const user = row.user;
        // If the user is not admin, nor the owner of the post, return.
        if (userId !== user && username !== 'admin'){
          return res.status(401).send({ error: 'Unauthorized' });
        }

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
          } else {
            res.status(204).send({id: this.lastID});
          }
        });

        // Finalizes the prepared statement to release its resources.
        stmt.finalize();
        }
      })
    userStmt.finalize();
  });

  /**
   * Middleware function to check if the user is authenticated.
   * @param {*} req 
   * @param {*} res 
   * @returns if the user is authenticated and the username.
   */
  function validateRequest(req, res) {
    const username = req.body.username || req.params.username || req.cookies.username;

    // Validates session.
    if (!req.body.debug && (!sessionIds.has(username) || req.cookies.ID !== sessionIds.get(username))) {
      return { valid: false, status: 401, message: 'No active session.' };
    } 

    // Checks if the CSRF token is a match.
    const csrfToken = req.cookies.csrfToken;
    if (req.headers['x-csrf-token'] !== csrfToken) {
      return { valid: false, status: 403, message: 'CSRF token mismatch.' };
    } 

    // Checks if the JWT token is a match.
    const jwtToken = req.cookies.jwtToken,
    decoded = verifyToken(jwtToken);
    if (!decoded) {
      return { valid: false, status: 401, message: 'Unauthorized.' };
    } 

    return { valid: true, username: decoded.username };
  }
}
