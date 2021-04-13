require('dotenv').config();
const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
  host: 'http://elastic:Infra2020@138.91.117.150:9201',

});

module.exports = {

  search(req,res){

    let {index, key, option_key} = req.body;
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