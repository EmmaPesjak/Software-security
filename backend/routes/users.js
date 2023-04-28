// const { createToken } = require('../token.js');

module.exports = function(db, app, crypto, sessionIds) {
  //* GET
  /**
   * Retrieves all users.
   */
  app.get('/api/users', (req, res) => {
    // The SQL query to retrieve all users.
    const sql = 'SELECT * FROM user';

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

  //* POST
  /**
   * Logs in the specified user.
   */
  app.post('/api/users/:userName', (req, res) => {
    const userName = req.params.userName,
    password = req.body.password,
    hashedPassword = sha256(password);

    // The SQL query to retrieve the specified user.
    const sql = 'SELECT * FROM user WHERE username = ? AND hashedPassword = ?'

    // Prepares the SQL statement.
    let stmt = db.prepare(sql);

    // Binds the parameters to the prepared statement.
    stmt.bind(userName, hashedPassword);

    // Executes the prepared statement and returns the result.
    stmt.get((err, row) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({"error": "Internal Server Error."});
      } else if (!row) {
        res.status(404).json({"error": "The username or password is wrong."});
      } else {
        // Assigns the user a session ID.
        sessionIds.set(userName, sha256(userName));

        // TODO Generate random token from token.js file.
        // const token = createToken(userId);  // ADDED BY EBBA

        const options = { // TODO Are there more options we should utilize?
          // httpOnly: true, // Only the server can access the cookie.
          maxAge: 1000 * 60 * 60, // Expires after 1 hour. // TODO How can expiration be handled? E.g., the frontend sends the user to the login page?
        }

        // TODO assign token????? xoxo ebba
        // res.cookie('token', token, options);

        res.cookie('ID', sessionIds.get(userName), options);
        res.status(200).json(row);
      }
    });

    // Finalizes the prepared statement to release its resources.
    stmt.finalize();
  });

  /**
   * Calculates hash.
   */
  function sha256(input) {
    const hash = crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
  }

  //* POST
  /**
   * Creates a user.
   */
  app.post('/api/users', function (req, res) {
    const {name, userName, email, password} = req.body,
    hashedPassword = sha256(password);

    // The SQL query to create a user.
    const sql = 'INSERT INTO user(username, hashedPassword, name, email) VALUES (?, ?, ?, ?) RETURNING *';

    // Prepares the SQL statement.
    const stmt = db.prepare(sql);

    // Binds the parameters to the prepared statement.
    stmt.bind(userName, hashedPassword, name, email);

    // Executes the prepared statement and returns the result.
    
    stmt.get(function(err, row) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            res.status(400).json({ message: 'User already exists' });
        } else {
            console.error(err.message);
            res.status(500).json({"error": "Internal Server Error."});
        }
      } else {
        res.status(201).send(row);
      }
    });

    // Finalizes the prepared statement to release its resources.
    stmt.finalize();
  });

}



