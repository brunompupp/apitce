const express = require('express');
const controller = require('../controllers/filtrar');
const routes = express.Router();

routes.get('/', controller.index);


module.exports = routes;