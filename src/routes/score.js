const express = require('express');
const controller = require('../controllers/score');
const routes = express.Router();

routes.get('/', controller.index);
// routes.post('/', controller.create);
// routes.put('/', controller.update);


module.exports = routes;