const routes = require('express').Router();
const Post = require('../models/posts');   // import post-schema

/**
 * Retrieve all countries.
 */
/*routes.get('/api/countries', async function (req, res) {
    await Country.find()
    .then(countries => res.status(200).json(countries))
});

/**
 * Retrieve a country based on provided param.
 */
/*routes.get('/api/countries/:country', async function (req, res) {
    const countryNameParam = req.params.country;
    const countryName = countryNameParam.replaceAll('_', ' ');

    await Country.findOne({country: countryName})
    .then(country => {
        if (country){
            res.status(200).json(country)   // if country exists, 200 OK
        } else {
            res.status(404).json({ error: "Country does not exist" })   // else, 404 not found
        }
    })
});

module.exports = routes;*/