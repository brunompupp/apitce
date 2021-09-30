const {client, indexCategoria, indexObjeto} = require('../configs/elastic');
const moment = require('moment');


exports.getCategorias = () => {
  try {
    client.search({
      index: indexCategoria,
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