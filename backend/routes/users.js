module.exports = function(db, app, crypto, createToken, verifyToken, sessionIds, csrfTokens, limiter, userSchema, body, validationResult ) {

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

  //* GET
  /**
   * Logs out the specified user.
   */
  app.get('/api/users/:userName', (req, res) => {
    const userName = req.params.userName;

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

    // Clears session.
    sessionIds.delete(userName);

    // Clears the cookies set by the server.
    res.clearCookie('ID');
    res.clearCookie('csrfToken');
    res.clearCookie('jwtToken');

    return res.status(200).send();
  });

  //* POST
  /**
   * Logs in the specified user.
   */
  app.post('/api/users/:userName', limiter, [
    body('password').trim().escape()
  ], (req, res) => {

    // Catch potential <html> and javascript code.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

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
        res.status(500).json('Internal Server Error.');
      } else if (!row) {
        res.status(404).json('The username or password is incorrect.');
      } else {
        // Assigns the user a session ID.
        sessionIds.set(userName, sha256(userName));

        //const token = createToken(userName);

        const options = { // TODO Are there more options we should utilize?
          httpOnly: true, // Only the server can access the cookie.
          secure: true,
          maxAge: 1000 * 60 * 60, // Expires after 1 hour. // TODO How can expiration be handled? E.g., the frontend sends the user to the login page?
        }

        // Create a CSRF token and send in a cookie.
        const secret = csrfTokens.secretSync();
        var csrfToken = csrfTokens.create(secret);
        res.cookie('csrfToken', csrfToken, {secure: true, maxAge: 1000 * 60 * 60});

        res.cookie('ID', sessionIds.get(userName), options); // TODO Use `token` instead of `sessionIds.get(userName)`.

        // Create a JWT token and send in a cookie.
        const jwtBearerToken = createToken(userName);
        res.cookie("jwtToken", jwtBearerToken, {secure: true, maxAge: 1000 * 60 * 60});

        //res.cookie('token', token, options);
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
   * Creates a user, by first validating userinput against <html> or javascript code.
   */
  app.post('/api/users', limiter, [
    body('email').trim().escape(),
    body('password').trim().escape(),
    body('name').trim().escape(),
    body('userName').trim().escape()
  ], function (req, res) {

    // Catch potential <html> and javascript code.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Validate user input against the Joi schema.
    const validationJoi = userSchema.validate(req.body);
    if (validationJoi.error) {
      return res.status(400).json({ message: validationJoi.error.details[0].message });
    }

    // Get validated fields from Joi.
    const { email, password, name, userName } = validationJoi.value;

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
