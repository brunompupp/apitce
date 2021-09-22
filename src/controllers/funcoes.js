require('dotenv').config();
const elasticsearch = require('elasticsearch');
const moment = require('moment');
const client = new elasticsearch.Client({
  host: process.env.ELASTIC

});
let index = 'categorias-tce'

exports.getCategorias = () => {
  try {
    client.search({
      index,
    }, function (err, resp, status) {
      if (err) {
        console.log(err)    
        return 'erro'
      }


      const { hits } = resp;

      const categorias = hits.hits;

      console.log(categorias)
      return categorias
    })

  } catch (error) {
    console.log(error.message);
    return false;
  }
}