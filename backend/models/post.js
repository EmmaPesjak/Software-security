const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/** Define schema for post */
const postSchema = new Schema({
    user: {
        type: String,
        required: true
    },
    content: {
        type: String
    }
});

// Export schema to enable access
const Post = mongoose.model('post', postSchema); 
module.exports = Post;