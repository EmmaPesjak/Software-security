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

        // Executes the prepared statement and returns the result.
        stmt.all([], (error, req) => {
            if (error) throw error;
            res.json(req);
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

        // Executes the prepared statement and returns the result.
        stmt.get((err, row) => {
            if (err) throw err;
            res.json(row);
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
        const sql = 'INSERT INTO user(username, hashedPassword, name, email) VALUES (?, ?, ?, ?)';

        // Prepares the SQL statement.
        const stmt = db.prepare(sql);

        // Binds the parameters to the prepared statement.
        stmt.bind(userName, hashedPassword, name, email);

        // Execute the prepared statement and returns the result.
        stmt.run(function (error) {
            if (error) throw error;
            res.json({id: this.lastID});
        });

        // Finalizes the prepared statement to release its resources.
        stmt.finalize();
    });
}
