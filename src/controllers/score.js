require('dotenv').config();
const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
  host: process.env.ELASTIC

});


module.exports = {
  index(req, res) {

    let { match, no_match, index, page, limit } = req.query;

    if (!page || page === "" || page === null || page === undefined) {
      page = 1
    }
    if (!limit || limit === "" || limit === null || limit === undefined) {
      limit = 100
    }

    limit = Number(limit);
    page = (Number(page) - 1) * limit;

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
        from: page,
        size: limit,
        body: body
      }, function (err, resp, status) {
        if (err) {
          return res.json(err)

        } else {
          const { hits } = resp;
          const qtd_hits = hits.total.value;
          const newHits = hits.hits;
          const result = [];


          newHits.map(item => (
            result.push({
              id: item._id,
              score: item._score,
              objeto: item._source.Objeto,
              Natureza: item._source.Natureza,
              porcentagem: (Number(item._score) * 100) / Number(hits.max_score)
            })
          ))

          return res.json({ pages: Math.round(qtd_hits / limit), qtd_hits, max_score: hits.max_score, result })

        }
      })


    } catch (e) {
      return res.json({ status: 'erro', message: e.message })
    }
  },


  update(req, res) {
    let { id } = req.params;
    let { field, value, index } = req.body;

    if (!field || field === null || field === undefined || field === '') {
      return res.json({ status: 'erro', message: 'Informe o field a ser atualizado.' })
    }

    if (!value || value === null || value === undefined || value === '') {
      return res.json({ status: 'erro', message: 'Informe o valor do field a ser atualizado.' })
    }
    if (!index || index === null || index === undefined || index === '') {
      return res.json({ status: 'erro', message: 'Informe o index a ser atualizado.' })
    }

    let objeto = {};

    objeto[field] = value;


    try {
      client.update({
        index: index,
        id: id,
        _source: `ctx.source.${field}.add(params.${field})`,
        body: {
          doc: objeto

        }
      }, function (err, resp, status) {
        if (err) {
          return res.json({ status: 'erro', message: err })
        } else {
          return res.json({ status: 'sucesso' })
        }
      })
    } catch (e) {
      return res.json({ status: 'erro', message: e.message })
    }



  },

  verifyFields(req, res) {
    let { keywords, filter, filterValue, noKeywords, index, page, limit } = req.query;

    console.table([keywords, filter, filterValue, noKeywords, index])


    if (!page || page === "" || page === null || page === undefined) {
      page = 1
    }


    if (!limit || limit === "" || limit === null || limit === undefined) {
      limit = 100
    }

    limit = Number(limit);
    page = (Number(page) - 1) * limit;

    try {

      if (!index || index === '' || index === null || index === undefined) {
        return res.json({ status: 'erro', message: 'Defina o index para a busca' });
      }


      if (noKeywords) {


        if (filter) {
          //
          //get all exits filter and not exists keywords

          client.search({
            index: index,
            from: page,
            size: limit,
            body: {
              "query": {
                "bool": {
                  "must": [
                    {
                      "exists": {
                        "field": filter,

                      }
                    }
                  ],
                  "must_not": [
                    {
                      "exists": {
                        "field": noKeywords
                      }
                    }
                  ]

                }
              }
            }
          }, function (err, resp, status) {
            if (err) {
              return res.json({ status: 'erro', message: err })
            } else {
              let { hits } = resp;
              let qtd_hits = hits.total.value;
              let newHits = hits.hits;
              let result = [];


              newHits.map(item => (
                result.push({
                  id: item._id,
                  objeto: item._source.Objeto,
                  classificacao: item._source[filter],
                })
              ))

              return res.json({ pages: Math.round(qtd_hits / limit), qtd_hits, result })
            }
          })
        } else {

          if (keywords) {

            client.search({
              index: index,
              from: page,
              size: limit,
              body: {
                "query": {
                  "bool": {
                    "must": [
                      {
                        "exists": {
                          "field": keywords,

                        }
                      }
                    ],
                    "must_not": [
                      {
                        "exists": {
                          "field": noKeywords
                        }
                      }
                    ]

                  }
                }
              }
            }, function (err, resp, status) {
              if (err) {
                return res.json({ status: 'erro', message: err })
              } else {
                let { hits } = resp;
                let qtd_hits = hits.total.value;
                let newHits = hits.hits;
                let result = [];


                newHits.map(item => (
                  result.push({
                    id: item._id,
                    objeto: item._source.Objeto,
                    classificacao: item._source[keywords],
                  })
                ))

                return res.json({ pages: Math.round(qtd_hits / limit), qtd_hits, result })
              }
            })
          } else {
            client.search({
              index: index,
              from: page,
              size: limit,
              body: {
                "query": {
                  "bool": {
                    "must_not": [
                      { "exists": { "field": noKeywords } }
                    ]
                  }
                }
              }

            }, function (err, resp, status) {
              if (err) {
                return res.json({ status: 'erro', message: err })
              }
              let { hits } = resp;
              let qtd_hits = hits.total.value;
              let newHits = hits.hits;
              let result = [];


              newHits.map(item => (
                result.push({
                  id: item._id,
                  dados: item._source
                })
              ))

              return res.json({ pages: Math.round(qtd_hits / limit), qtd_hits, result })

            })
          }





        }

      } else {


        if (!keywords || keywords === null || keywords === undefined || keywords === "") {


          if (!filter || filter === null || filter === undefined || filter === '') {
            return res.json({ status: 'erro', message: 'Informe keyword ou classificação para a busca.' })
          } else {
            //get all exists filter

            client.search({
              index: index,
              from: page,
              size: limit,
              body: {
                "query": {
                  "exists": {
                    "field": filter
                  }
                }
              }

            }, function (err, resp, status) {
              if (err) {
                return res.json({ status: 'erro', message: err })
              }

              return res.json(resp)
            })
          }


        } else {

          if (filter) {
            let objeto = {};
            objeto[filter] = filterValue;
            //get all exists keywords and filter
            if (!filterValue || filterValue === null || filterValue === undefined || filterValue === '') {
              return res.json({ status: 'erro', message: "Informe o valor do filtro" })
            }
            client.search({
              index: index,
              from: page,
              size: limit,
              body: {
                "query": {
                  "bool": {
                    "must": [
                      { "exists": { "field": keywords } },
                      { "match_phrase": objeto }
                    ]
                  }
                }
              }
            }, function (err, resp, status) {
              if (err) {
                return res.json({ status: 'erro', message: err })
              }
              let { hits } = resp;
              let qtd_hits = hits.total.value;
              let newHits = hits.hits;
              let result = [];


              newHits.map(item => {
                let field = {};
                field["id"] = item._id;
                
                let keys = item._source[keywords].split(',');

                field[keywords] = keys;
                
                
                result.push(field)

              })

              return res.json({ pages: Math.round(qtd_hits / limit), qtd_hits, result })
            })
          } else {
            //get all exists keywords
            client.search({
              index: index,
              from: page,
              size: limit,
              body: {
                "query": {
                  "exists": {
                    "field": keywords
                  }
                }
              }
            }, function (err, resp, status) {
              if (err) {
                return res.json({ status: 'erro', message: err })
              }

              return res.json(resp)

            })
          }


        }


      }




    } catch (e) {
      return res.json({ status: 'erro', message: e.message })
    }



  }



}