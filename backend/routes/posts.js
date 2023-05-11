// const { verifyToken } = require('../token.js');

module.exports = function(db, app, createToken, verifyToken, sessionIds, csrfTokens, limiter, postSchema, body, validationResult) {

  //TODO verify CSRF in all (or atleast POST etc) endpoints

  //* GET
  /**
   * Retrieves all posts.
   */
  app.get('/api/users/:userName/posts', (req, res) => {
    const userName = req.params.userName;

    // Validates session.
    if (!req.body.debug && (!sessionIds.has(userName) || req.cookies.ID !== sessionIds.get(userName))) {
      return res.status(401).json({"error":'No active session.'});
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
    stmt.all(function(err, rows) {
      if (err) {
        console.error(err.message);
        res.status(500).json('Internal Server Error.');
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

  //* POST
  /**
   * Creates a post.
   */
  app.post('/api/posts', limiter, [
    body('content').trim().escape()
  ], (req, res) => {

    // Catch potential <html> and javascript code.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Validate user input against the Joi schema.
    const validationJoi = postSchema.validate(req.body);
    if (validationJoi.error) {
      return res.status(400).json({message: validationJoi.error.details[0].message});
    }

    // Get validated fields from Joi.
    const {content} = validationJoi.value;

    // Check if csrf-token match.
    const csrfToken = req.cookies.csrfToken;
    if (req.headers['x-csrf-token'] !== csrfToken) {
      
      return res.status(403).send({ error: 'CSRF token mismatch' });
    }

    // If the jwtToken in the cookies is the same as the generated one, the user is authorized.
    const jwtToken = req.cookies.jwtToken;
    const decoded = verifyToken(jwtToken);
    if (!decoded){
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const username = decoded.username;

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
    userId = req.body.userId,
    userName = req.body.userName;

    // Validates session.
    if (!req.body.debug && (!sessionIds.has(userName) || req.cookies.ID !== sessionIds.get(userName))) {
      return res.status(401).json('No active session.');
    }
    // Checks if the CSRF token is a match.
    const csrfToken = req.cookies.csrfToken;
    if (req.headers['x-csrf-token'] !== csrfToken) {
      return res.status(403).json('CSRF token mismatch.');
    }
    // Checks if the JWT token is a match.
    const jwtToken = req.cookies.jwtToken,
    decoded = verifyToken(jwtToken);
    if (!decoded){
      return res.status(401).json('Unauthorized.');
    }

    const deleteDislike = db.prepare('DELETE FROM dislike WHERE post = ? AND user = ?');
    deleteDislike.bind(postId, userId);

    deleteDislike.run((err) => {
      if (err) res.status(500).json('Internal Server Error.');
    });

    deleteDislike.finalize();

    const selectLike = db.prepare('SELECT d.user FROM like AS d WHERE d.post = ? AND d.user = ?');
    selectLike.bind(postId, userId);

    selectLike.get((err, row) => {
      if (err) res.status(500).json('Internal Server Error.');
      else if (row === undefined) {
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

  //* POST
  /**
   * Dislikes the specified post.
   */
  app.post('/api/posts/dislike/:postId', (req, res) => {
    const postId = req.params.postId,
    userId = req.body.userId,
    userName = req.body.userName;

    // Validates session.
    if (!req.body.debug && (!sessionIds.has(userName) || req.cookies.ID !== sessionIds.get(userName))) {
      return res.status(401).json('No active session.');
    }
    // Checks if the CSRF token is a match.
    const csrfToken = req.cookies.csrfToken;
    if (req.headers['x-csrf-token'] !== csrfToken) {
      return res.status(403).json('CSRF token mismatch.');
    }
    // Checks if the JWT token is a match.
    const jwtToken = req.cookies.jwtToken,
    decoded = verifyToken(jwtToken);
    if (!decoded){
      return res.status(401).json('Unauthorized.');
    }

    const deleteLike = db.prepare('DELETE FROM like WHERE post = ? AND user = ?');
    deleteLike.bind(postId, userId);

    deleteLike.run((err) => {
      if (err) res.status(500).json('Internal Server Error.');
    });

    deleteLike.finalize();

    const selectDislike = db.prepare('SELECT d.user FROM dislike AS d WHERE d.post = ? AND d.user = ?');
    selectDislike.bind(postId, userId);

    selectDislike.get((err, row) => {
      if (err) res.status(500).json('Internal Server Error.');
      else if (row === undefined) {
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

  //* PATCH
  /**
   * Updates the specified post.
   */
  app.patch('/api/posts/:postId', limiter, (req, res) => {
    const postId = req.params.postId;
    // const user = req.body.user;  // userID
    // const content = req.body.content;
    // Validate post input.
    const validationResult = postSchema.validate(req.body);
    if (validationResult.error) {
      // Här fastnar alla requests för mig och säger typ att user must be a string
      console.log(validationResult.error.details[0].message);
      console.log(validationResult.value);
      return res.status(400).json({error: validationResult.error.details[0].message});
    }
    // Get validated fields from Joi.
    const { user, content } = validationResult.value;

    // Check if csrf-token match.
    const csrfToken = req.cookies.csrfToken;
    if (req.headers['x-csrf-token'] !== csrfToken) {
      return res.status(403).send({ error: 'CSRF token mismatch' });
    }

    // If the jwtToken in the cookies is the same as the generated one, the user is authorized.
    const jwtToken = req.cookies.jwtToken;
    const decoded = verifyToken(jwtToken);
    if (!decoded){
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // The SQL query to update the specified post.
    const sql = 'UPDATE post SET content = ? WHERE postId = ? AND user = ?';

    // Prepares the SQL statement.
    const stmt = db.prepare(sql);

    // Binds the parameters to the prepared statement.
    stmt.bind(content, postId, user);

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

  //* DELETE
  /**
   * Deletes the specified post.
   */
  app.delete('/api/posts/:id', limiter, (req, res) => {
    const postId = req.params.id,
    userId = Number(req.cookies.userid);

    // Check if csrf-token match.
    const csrfToken = req.cookies.csrfToken;
    if (req.headers['x-csrf-token'] !== csrfToken) {
      return res.status(403).send({ error: 'CSRF token mismatch' });
    }

    // If the jwtToken in the cookies is the same as the generated one, the user is authorized.
    const jwtToken = req.cookies.jwtToken;
    const decoded = verifyToken(jwtToken);
    if (!decoded){
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const userSql = 'SELECT user FROM post WHERE postId = ?'
    const userStmt = db.prepare(userSql);
    userStmt.bind(postId);

    userStmt.get((err, row) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({"error": "Internal Server Error."});
      } else {
        const user = row.user;
        // if the user is not admin, nor the owner of the post, return.
        if (userId !== user && decoded.username !== 'admin'){
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

  // Middleware function to check if the user is authenticated.
  function requireAuth(req, res, next) {
    const sessionId = req.cookies.ID; // Assuming the session ID is stored in a cookie called "ID".

    if (sessionId && sessionIds.hasValue(sessionId)) {
      // The user is authenticated. Allow the request to continue.
      next();
    } else {
      // The user is not authenticated. Return a 401 Unauthorized response.
      res.status(401).json({ error: 'Unauthorized.' });
    }
  }
}
