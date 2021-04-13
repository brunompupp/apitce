const express = require('express');
const controller = require('../controllers/search');
const routes = express.Router();

routes.post('/', controller.search);

module.exports = routes;