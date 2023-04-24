// Include all needed modules
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
require('dotenv').config();


// Import the routes 
const postRoutes = require('./routes/posts');

// Create an Express application
const app = express();
app.use(cors());  
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));



// Define the port the server will accept connections on
const port = process.env.PORT || 3000;

// Start the server
app.listen(port, function() {
    console.log(`Server is running on port ${port}`);
});

// Enable the routes in app
app.use('/', postRoutes);