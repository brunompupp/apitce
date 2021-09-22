const express = require('express');
const controller = require('../controllers/categorias');
const routes = express.Router();

routes.get('/', controller.index);
routes.get('/listar', controller.listar);
routes.post('/', controller.create);
routes.put('/', controller.update);
routes.put('/atualizar', controller.atualizar);
routes.delete('/', controller.delete);

module.exports = routes;