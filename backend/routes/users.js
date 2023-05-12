module.exports = function(db, app, crypto, createToken, verifyToken, sessionIds, csrfTokens, limiter, body, validationResult) {

  /**
   * Logs out the specified user.
   */
  app.get('/api/users/:userName', (req, res) => {

    // Validates session and user.
    const validation = validateRequest(req);
    if (!validation.valid) {
      res.status(validation.status).json(validation.message);
      return;
    }

    // Get username from validation.
    const userName = validation.username;

    // Clears session.
    sessionIds.delete(userName);

    // Clears the cookies set by the server.
    res.clearCookie('ID');
    res.clearCookie('csrfToken');
    res.clearCookie('jwtToken');

    return res.status(200).send();
  });

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

    // If valid input, retrieve values and get the hashed-password.
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

        const options = {
          httpOnly: true, // Only the server can access the cookie.
          secure: true,
          maxAge: 1000 * 60 * 60, // Expires after 30 minutes.
        }

        // Create a CSRF token and send in a cookie.
        const secret = csrfTokens.secretSync();
        let csrfToken = csrfTokens.create(secret);
        res.cookie('csrfToken', csrfToken, {secure: true, maxAge: 1000 * 60 * 60});

        // Send the session-id in a cookie.
        res.cookie('ID', sessionIds.get(userName), options);

        // Create a JWT token and send in a cookie.
        const jwtBearerToken = createToken(userName);
        res.cookie("jwtToken", jwtBearerToken, {secure: true, maxAge: 1000 * 60 * 60});
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

  /**
   * Creates a user, by first validating userinput against <html> or javascript code.
   */
  app.post('/api/users', limiter, [
    body('email').trim().escape(),
    body('password').trim().escape(),
    body('name').trim().escape(),
    body('userName').trim().escape()
  ], (req, res) => {

    // Catch potential <html> and javascript code.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Get validated fields.
    const { email, password, name, userName } = req.body;
    const hashedPassword = sha256(password);

    // The SQL query to create a user.
    const sql = 'INSERT INTO user(username, hashedPassword, name, email) VALUES (?, ?, ?, ?) RETURNING *';

    // Prepares the SQL statement.
    const stmt = db.prepare(sql);

    // Binds the parameters to the prepared statement.
    stmt.bind(userName, hashedPassword, name, email);

    // Executes the prepared statement and returns the result.
    stmt.get((err, row) => {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          console.log(err);
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
