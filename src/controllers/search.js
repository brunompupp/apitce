require('dotenv').config();
const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
  host: process.env.ELASTIC

});

module.exports = {

  search(req,res){

    let {index, key, option_key} = req.body;

    if(!index || index === '' || index === null || index === undefined){
      return res.json({status:'erro', message: 'Defina o index para a busca'});
    }
    if(!key || key === '' || key === null || key === undefined){
      return res.json({status:'erro', message: 'Defina uma key para busca'});
    }
    
    client.search({
      index:index,
      size: 10000,
      body:{
        "query": {
          "match": {
            "Objeto": key +","+ option_key,
          }
        }
      }
    }, function(err, resp, status){
      if(err){
        return res.json(err)

      }else{
        const {hits} = resp;
        return res.json({resultado: hits})
      }
    })

  }

}