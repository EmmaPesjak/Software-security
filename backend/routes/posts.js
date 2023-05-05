// const { verifyToken } = require('../token.js');

module.exports = function(db, app, createToken, verifyToken, sessionIds) {

  //* GET
  /**
   * Retrieves all posts.
   */
  app.get('/api/users/:userName/posts', (req, res) => {
    const userName = req.params.userName;

    // TODO Use `verifyToken` instead.
    //if (!req.body.debug && (!sessionIds.has(userName) || req.cookies.ID !== sessionIds.get(userName))){
    //  console.log("No logged in user");
    //  return;
    //} //return res.redirect('/');//return res.status(401).json({"error": "No active session."});
    //const token = req.cookies.token;

    //if (!verifyToken(token)){
    //  return res.status(401).json({"error": "No active session."});
    //}

    // The SQL query to retrieve all posts..
    const sql = `
    SELECT p.*, u.username, u.name,
    (SELECT DISTINCT COUNT(l.user) FROM like AS l WHERE l.post = p.postId) AS likes,
    (SELECT DISTINCT COUNT(d.user) FROM dislike AS d WHERE d.post = p.postId) AS dislikes
    FROM post AS p
    INNER JOIN user AS u ON p.user = u.userId
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
  app.post('/api/posts', (req, res) => {
    const {content, username} = req.body;

    // #TODO verify token  
    //const {content, token} = req.body;
    //const decodedToken = verifyToken(token);
    //if (!decodedToken) {
    //  return res.status(401).json({ error: 'Invalid token' });
    //}
    // If the user is authenticated, assign the token's userId to user.
    //const user = decodedToken.userId;


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
    user = req.body.user;

    const insertLikedQuery = 'INSERT INTO like (post, user) VALUES (?, ?)';
    const stmtInsert = db.prepare(insertLikedQuery);

    stmtInsert.bind(postId, user);

    stmtInsert.run(function(err) {
      if (err) {
        // If there was an error (unique constraint, it is already in the db), unlike the post.
        const deleteQuery = 
        'DELETE FROM like WHERE user = ? AND post = ?';
        const stmtDelete = db.prepare(deleteQuery);
        stmtDelete.bind(user, postId);
        stmtDelete.run(function(err){
          if (err) {
            console.error(err.message);
            res.status(500).json({"error": "Internal Server Error."});
          } else {
            res.status(201).send();
          }
        });
        stmtDelete.finalize();
      } else {
        // Success
        // If the user has disliked the post earlier, make sure to delete it from that table.
        // #TODO FIND ANOTHER WAY SO AN ERROR IS NOT SENT????
        const deleteQuery = 
        'DELETE FROM dislike WHERE user = ? AND post = ?';
        const stmtDelete = db.prepare(deleteQuery);
        stmtDelete.bind(user, postId);
        stmtDelete.run(function(err){
          if (err) {
            console.error(err.message);
            //res.status(500).json({"error": "User had not disliked the post."});
          } else {
            res.status(201).send();
          }
        });
        stmtDelete.finalize();
        res.sendStatus(200);
      }
    })

    stmtInsert.finalize();
  });

    
  //* POST
  /**
   * Dislikes the specified post.
   */
  app.post('/api/posts/dislike/:postId', (req, res) => {

    const postId = req.params.postId,
    user = req.body.user;

    const insertLikedQuery = 'INSERT INTO dislike (post, user) VALUES (?, ?)';

    const stmtInsert = db.prepare(insertLikedQuery);
    stmtInsert.bind(postId, user);

    stmtInsert.run(function(err) {
      if (err) {
        const deleteQuery = 
        'DELETE FROM dislike WHERE user = ? AND post = ?';
        const stmtDelete = db.prepare(deleteQuery);
        stmtDelete.bind(user, postId);
        stmtDelete.run(function(err){
          if (err) {
            console.error(err.message);
            res.status(500).json({"error": "Internal Server Error."});
          } else {
            res.status(201).send();
          }
        });
        stmtDelete.finalize();
      } else {
        // Success
        // If the user has liked the post earlier, make sure to delete it from that table.
        const deleteQuery = 
        'DELETE FROM like WHERE user = ? AND post = ?';
        const stmtDelete = db.prepare(deleteQuery);
        stmtDelete.bind(user, postId);
        stmtDelete.run(function(err){
          if (err) {
            console.error(err.message);
            //res.status(500).json({"error": "User had not liked the post."});
          } else {
            res.status(201).send();
          }
        });
        stmtDelete.finalize();
        res.sendStatus(200);
      }
    })

    stmtInsert.finalize();
  });

  //* PATCH
  /**
   * Updates the specified post.
   */
  app.patch('/api/posts/:postId', (req, res) => {
    const postId = req.params.postId;
    const user = req.body.user;  // userID
    const content = req.body.content;

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
   * Get the liked posts for the user.
   */
  app.get('/api/posts/liked/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = 'SELECT post FROM like WHERE user = ?';
    const stmt = db.prepare(sql);
    
    stmt.all(userId, function(err, rows) {
      if (err) {
        console.error(err.message);
        res.status(500).json({"error": "Internal Server Error."});
      } else {
        res.status(200).send(rows);
      }
    });
  
    stmt.finalize();
  });

  
  app.get('/api/posts/disliked/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = 'SELECT post FROM dislike WHERE user = ?';
    const stmt = db.prepare(sql);
    
    stmt.all(userId, function(err, rows) {
      if (err) {
        console.error(err.message);
        res.status(500).json({"error": "Internal Server Error."});
      } else {
        const postIds = rows.map(row => row.post);
        res.status(200).send(postIds);
      }
    });
  
    stmt.finalize();
  });
  




  // REMOVE ???????


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


  // Middleware function to check if the user is authenticated.
  function requireAuth(req, res, next) {
    const sessionId = req.cookies.ID; // Assuming the session ID is stored in a cookie called "ID".

    if (sessionId && sessionIds.hasValue(sessionId)) {
      // The user is authenticated. Allow the request to continue.
      next();
    } else {
      // The user is not authenticated. Return a 401 Unauthorized response.
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
}
