require('dotenv').config();
const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
  host: process.env.ELASTIC

});


module.exports = {
  index(req, res) {

    let { match, no_match, index } = req.query;

    try {
      if (!index || index === '' || index === null || index === undefined) {
        return res.json({ status: 'erro', message: 'Defina o index para a busca' });
      }

      if (!match || match === '' || match === null || match === undefined) {
        return res.json({ status: 'erro', message: 'Informe ao menos o match para a busca!' })
      }


      let body;

      if (no_match) {


        body = {
          "query": {
            "bool": {
              "must": [
                {
                  "term": {
                    "Objeto": match,

                  }
                }
              ],
              "must_not": [
                {
                  "term": {
                    "Objeto": no_match
                  }
                }
              ]

            }
          }
        }


      } else {


        body = {
          "query": {
            "match": {
              "Objeto": match,
            },
          }
        }
      }

      client.search({
        index: index,
        size: 10000,
        body: {
          "query": {
            "bool": {
              "must": [
                {
                  "match": {
                    "Objeto": match,

                  }
                }
              ],
              "must_not": [
                {
                  "match": {
                    "Objeto": no_match
                  }
                }
              ]

            }
          }
        }
      }, function (err, resp, status) {
        if (err) {
          return res.json(err)

        } else {
          const { hits } = resp;
          const qtd_hits = hits.total.value;
          const newHits = hits.hits;
          const result = [];


          newHits.map(item =>(
            result.push({
              id:item._id,
              score:item._score,
              objeto:item._source.Objeto,
              Natureza:item._source.Natureza,

            })
          ))


          return res.json({qtd_hits, max_score:hits.max_score, result })

        }
      })


    } catch (e) {
      return res.json({ status: 'erro', message: e.message })
    }
  }
}