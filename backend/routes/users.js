module.exports = function(db, app, crypto) {
    //* GET
    /**
     * Retrieves all users.
     */
    app.get('/api/users', (req, res) => {
        // The SQL query to retrieve all users.
        const sql = 'SELECT * FROM user';

        // Prepares the SQL statement.
        const stmt = db.prepare(sql);

        stmt.all(function(err, rows) {
            if (err) {
                console.error(err.message);
              res.status(500).send('Internal Server Error');
            } else {
              res.status(200).json(rows);
            }
          });

        // Finalizes the prepared statement to release its resources.
        stmt.finalize();
    });

    //* GET
    /**
     * Retrieves the specified user.
     */
    app.get('/api/users/:userName', (req, res) => {
        const userName = req.params.userName,
        password = req.body.password,
        hashedPassword = sha256(password);

        // The SQL query to retrieve the specified user.
        const sql = 'SELECT * FROM user WHERE username = ? AND hashedPassword = ?'

        // Prepares the SQL statement.
        let stmt = db.prepare(sql);

        // Binds the parameters to the prepared statement.
        stmt.bind(userName, hashedPassword);

        stmt.get((err, row) => {
            if (err) {
                
                console.error(err.message);
              res.status(500).send('Internal Server Error');
            } else if (!row) {
              res.status(404).send('User not found');
            } else {
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
        stmt.get(function(err, result) {
            if (err) {
              console.error(err.message);
              res.status(500).send('Internal Server Error');
            } else {
              res.status(201).send(result);
            }
          });
        // Finalizes the prepared statement to release its resources.
        stmt.finalize();
    });
}
