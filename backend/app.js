// Required modules.
const sqlite3 = require('sqlite3').verbose(),
express = require('express'),
cors = require('cors'),
crypto = require('crypto'),
cookieParser = require('cookie-parser'),
users = require('./routes/users'),
posts = require('./routes/posts'),
token = require('./token.js');



// Opens a connection to the DB.
// The DB consists of four tables:
// `user(userId, username, hashedPassword, name, email)`,
// `post(postId, content, user)`,
// `like(post, user)` and `dislike(post, user)`.
// Tutorial on how to query data from the DB: https://www.sqlitetutorial.net/sqlite-nodejs/query/.
const db = new sqlite3.Database('./guestbook.db', (err) => {
    if (err) return console.error(err.message);
    console.log('Opened a connection to the database.');
});

// Once the DB connection has been established.
if (db) {
    // Creates an Express app.
    const app = express();
    // Enables CORS.
    app.use(cors({origin: 'http://localhost:4200', credentials: true}));
    // Enables parsing of JSON requests
    // (puts the parsed data in `req.body`).
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    // Enables parsing of cookies.
    app.use(cookieParser());

    // Add no-store to cache-control to prevent sensitive data and updates to be cached.
    app.use('/api', (req, res, next) => {
        res.setHeader('Cache-Control', 'no-store');
        next();
      });

    // The port utilized by the server.
    const port = process.env.PORT || 3000;
    // Starts the server.
    app.listen(port, () => {
        console.log(`The server is running on port ${port}.`);
    });

    const sessionIds = new Map();

    // Exports `db`, `app`, `crypto`, `createToken`, `verifyToken`, and `sessionIds`.
    users(db, app, crypto, token.createToken, token.verifyToken, sessionIds);
    posts(db, app, token.createToken, token.verifyToken, sessionIds);
}

// // Closes the connection to the DB.
// db.close((err) => {
//     if (err) return console.error(err.message);
//     console.log('Closed the connection to the database.');
// });
