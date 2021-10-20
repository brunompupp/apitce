const express = require('express');
const controller = require('../controllers/keywords');
const routes = express.Router();

routes.post('/', controller.index);
routes.post('/semClassificacao', controller.show)

module.exports = routes;