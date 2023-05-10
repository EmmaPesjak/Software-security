const Joi = require('joi');

/**
 * Schemas for posts and users, used for input validations (whitelisting), protecting against XSS attacks. 
 */

const postSchema = Joi.object({
    content: Joi.string().min(10).max(500).required(),
    username: Joi.string().alphanum().min(3).max(30).required()
  });

const userSchema = Joi.object({
  name: Joi.string().required(),
  userName: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(12)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+}{"\':;?/>.<,]).*$'))
    .disallow(Joi.ref('name'))
    .disallow(Joi.ref('userName'))
    .required(),
});

module.exports = {postSchema, userSchema};