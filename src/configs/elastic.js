require('dotenv').config();
const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
  host: process.env.ELASTIC

});


module.exports = {
  indexCategoria: 'categorias-tce',
  indexObjeto: 'objetos-tce',
  client
}