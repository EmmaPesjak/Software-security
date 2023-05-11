const Joi = require('joi');


// EBBA DETTA BLIR BAJS mvh emma

/**
 * Schemas for posts and users, used for input validations (whitelisting), protecting against XSS attacks. 
 */

const postSchema = Joi.object({
    content: Joi.string().min(1).max(500).required(),
    user: Joi.string().alphanum().min(1).max(30).required()
    // säger att user must be string? men vi har ju siffror?
  });

const userSchema = Joi.object({
  name: Joi.string().required(),
  userName: Joi.string().alphanum().min(1).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(12)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+}{"\':;?/>.<,]).*$'))
    .disallow(Joi.ref('name'))
    .disallow(Joi.ref('userName'))
    .required(),
});

module.exports = {postSchema, userSchema};