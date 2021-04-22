const express = require('express');
const controller = require('../controllers/score');
const routes = express.Router();

routes.get('/', controller.index);
routes.get('/field', controller.verifyFields);
routes.put('/:id', controller.update);


module.exports = routes;