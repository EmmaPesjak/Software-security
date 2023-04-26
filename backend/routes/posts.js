module.exports = function(db, app) {
    //* GET
    /**
     * Retrieves all posts.
     */
    app.get('/api/posts', (req, res) => {
        // The SQL query to retrieve all users.
        const sql = 'SELECT p.*, u.name FROM post AS p, user AS u WHERE p.user = u.userId';

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
     * Retrieves the specified post.
     */
    app.get('/api/posts/:postId', (req, res) => {
        const postId = req.params.postId;

        // The SQL query to retrieve the specified user.
        const sql = 'SELECT p.*, u.name FROM post AS p, user AS u WHERE postId = ? AND p.user = u.userId'

        // Prepares the SQL statement.
        let stmt = db.prepare(sql);

        // Binds the parameters to the prepared statement.
        stmt.bind(postId);

        // Executes the prepared statement and returns the result.
        stmt.get((err, row) => {
            if (err) throw err;
            res.json(row);
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

        // The SQL query to create a post.
        const sql = 'INSERT INTO post(content, user) VALUES (?, ?)';

        // Prepares the SQL statement.
        const stmt = db.prepare(sql);

        // Binds the parameters to the prepared statement.
        stmt.bind(content, user);

        // Executes the prepared statement and returns the result.
        stmt.run(function (error) {
            if (error) throw error;
            res.json({id: this.lastID});
        });

        // Finalizes the prepared statement to release its resources.
        stmt.finalize();
    });

    //* POST
    /**
     * Likes the specified post.
     */
    app.post('/api/posts/like/:postId', (req, res) => {
        const postId = req.params.postId,
        user = req.body.user;

        // The SQL query to like the specified post.
        const sql = 'INSERT INTO like(post, user) VALUES (?, ?)';

        // Prepares the SQL statement.
        const stmt = db.prepare(sql);

        // Binds the parameters to the prepared statement.
        stmt.bind(postId, user);

        // Executes the prepared statement and returns the result.
        stmt.run((error) => {
            if (error) {
                console.error(error.message);
                res.status(500).send('Internal server error.');
            } else {
                res.status(204).send({id: this.lastID});
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

        // The SQL query to like the specified post.
        const sql = 'INSERT INTO dislike(post, user) VALUES (?, ?)';

        // Prepares the SQL statement.
        const stmt = db.prepare(sql);

        // Binds the parameters to the prepared statement.
        stmt.bind(postId, user);

        // Executes the prepared statement and returns the result.
        stmt.run((error) => {
            if (error) {
                console.error(error.message);
                res.status(500).send('Internal server error.');
            } else {
                res.status(204).send({id: this.lastID});
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
        stmt.run((error) => {
            if (error) {
                console.error(error.message);
                res.status(500).send('Internal server error.');
            } else {
                res.status(204).send({id: this.lastID});
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
        stmt.run((error) => {
            if (error) {
                console.error(error.message);
                res.status(500).send('Internal server error.');
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

        // The SQL query to delete the specified post.
        const sql = 'DELETE FROM like WHERE post = ? AND user = ?';

        // Prepares the SQL statement.
        const stmt = db.prepare(sql);

        // Binds the parameters to the prepared statement.
        stmt.bind(postId, user);

        // Executes the prepared statement and returns the result.
        stmt.run((error) => {
            if (error) {
                console.error(error.message);
                res.status(500).send('Internal server error.');
            } else {
                res.status(204).send({id: this.lastID});
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

        // The SQL query to delete the specified post.
        const sql = 'DELETE FROM dislike WHERE post = ? AND user = ?';

        // Prepares the SQL statement.
        const stmt = db.prepare(sql);

        // Binds the parameters to the prepared statement.
        stmt.bind(postId, user);

        // Executes the prepared statement and returns the result.
        stmt.run((error) => {
            if (error) {
                console.error(error.message);
                res.status(500).send('Internal server error.');
            } else {
                res.status(204).send({id: this.lastID});
            }
        });

        // Finalizes the prepared statement to release its resources.
        stmt.finalize();
    });
}
