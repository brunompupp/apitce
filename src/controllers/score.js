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
      }, function (err, resp, status) {
        if (err) {
          return res.json(err)

        } else {
          const { hits } = resp;
          return res.json({ resultado: hits })
        }
      })


    } catch (e) {
      return res.json({ status: 'erro', message: e.message })
    }
  }
}