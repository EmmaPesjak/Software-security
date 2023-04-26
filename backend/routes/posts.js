module.exports = function(db, app) {
    //* GET
    /**
     * Retrieves all posts.
     */
    app.get('/api/posts', (req, res) => {
        // The SQL query to retrieve all posts..
        const sql = 'SELECT p.*, u.name FROM post AS p, user AS u WHERE p.user = u.userId';

        // Prepares the SQL statement.
        const stmt = db.prepare(sql);

        // Executes the prepared statement and returns the result.
        stmt.all([], (error, req) => {
            if (error){
                console.error(error.message);
                res.status(500).send('Internal server error.');
            } else {
                res.status(200).send(req);
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
        const sql = 'SELECT p.*, u.name FROM post AS p, user AS u WHERE postId = ? AND p.user = u.userId'

        //const sql = 'SELECT * FROM post WHERE postId = ?';

        // Prepares the SQL statement.
        let stmt = db.prepare(sql);

        // Binds the parameters to the prepared statement.
        stmt.bind(postId);

        // Executes the prepared statement and returns the result.
        stmt.get((err, row) => {
            if (err){
                console.error(error.message);
                res.status(500).send('Internal server error.');
            } else if (!row) { // Check if no row was found
                res.status(404).send('Post not found.'); // Return a 404 status code
            } else {
                res.status(200).send(row);
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
      
        // Check if user in question exists.
        const sqlCheckUser = 'SELECT * FROM user WHERE userId = ?';
        const stmtCheckUser = db.prepare(sqlCheckUser);
        stmtCheckUser.bind(user);
      
        stmtCheckUser.get((error, row) => {
            if (error) {
                console.error(error.message);
                res.status(500).send('Internal server error.');
                return;
            } else if (!row) {
                res.status(404).send('User not found.');
                return;
            }
            
            //stmtCheckUser.finalize();
        
            // The SQL query to create a post.
            const sql = 'INSERT INTO post(content, user) VALUES (?, ?)';
        
            // Prepares the SQL statement.
            const stmt = db.prepare(sql);
        
            // Binds the parameters to the prepared statement.
            stmt.bind(content, user);
        
            // Executes the prepared statement and returns the result.
            stmt.run((error) => {
                if (error) {
                    console.error(error.message);
                    res.status(500).send('Internal server error.');
                } else {
                    res.status(204).send({id: stmt.lastID});
                }
                // Finalizes the prepared statement to release its resources.
                stmt.finalize();
            });
        });
        
      
        stmtCheckUser.finalize();
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
