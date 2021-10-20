const { client, indexObjeto } = require('../configs/elastic');
const moment = require('moment');
moment.locale('pt-br');



async function existeField(page, limit, field) {
  let body = {
    "query": {
      "exists": {
        "field": field
      }
    }
  }


  let respo = await client.search({
    index: indexObjeto,
    from: page,
    size: limit,
    body
  })

  let newDados = [];
  let newHits = respo.hits.hits;
  let total = respo.hits.total.value;
  let pages = Math.round(total / limit);

  newHits.map(item => {
    let idElastic = item._id;
    let source = item._source;

    newDados.push({ idElastic: idElastic, source: source })
  })

  return { total, pages, dados: newDados };

}

async function naoExisteField(page, limit, field) {

  let body = {
    "query": {
      "bool": {
        "must_not": [
          {
            "exists": {
              "field": field
            }
          }
        ]

      }
    }
  }


  let respo = await client.search({
    index: indexObjeto,
    from: page,
    size: limit,
    body
  })

  let newDados = [];
  let newHits = respo.hits.hits;
  let total = respo.hits.total.value;
  let pages = Math.round(total / limit);

  newHits.map(item => {
    let idElastic = item._id;
    let source = item._source;

    newDados.push({ idElastic: idElastic, source: source })
  })

  return { total, pages, dados: newDados };

}
async function existeFieldAndNot(page, limit, field, notField) {
  let body = {
    "query": {
      "bool": {
        "must": [
          {
            "exists": {
              "field": field,

            }
          }
        ],
        "must_not": [
          {
            "exists": {
              "field": notField
            }
          }
        ]

      }
    }
  }


  let respo = await client.search({
    index: indexObjeto,
    from: page,
    size: limit,
    body
  });

  let newDados = [];
  let newHits = respo.hits.hits;
  let total = respo.hits.total.value;
  let pages = Math.round(total / limit);

  newHits.map(item => {
    let idElastic = item._id;
    let source = item._source;

    newDados.push({ idElastic: idElastic, source: source })
  })

  return { total, pages, dados: newDados };

}



module.exports = {
  async index(req, res) {
    let { page, limit, existNameField, notExistNameField } = req.query;
    if (!page || page === "" || page === null || page === undefined) {
      page = 1
    }
    if (!limit || limit === "" || limit === null || limit === undefined) {
      limit = 1000
    }

    limit = Number(limit);
    page = (Number(page) - 1) * limit;

    if (!existNameField || existNameField === null || existNameField === '' || existNameField === undefined) {
      existNameField = false
    }
    if (!notExistNameField || notExistNameField === null || notExistNameField === '' || notExistNameField === undefined) {
      notExistNameField = false
    }

    try {
      let dados;

      if (!existNameField && !notExistNameField) {
        return res.json({ status: 'erro', message: 'Especifique um campo existente ou inexistente para a busca.' })
      }

      if (existeField && notExistNameField) {
        dados = await existeFieldAndNot(page, limit, existNameField, notExistNameField);

      }

      if (existNameField && !notExistNameField) {
        dados = await existeField(page, limit, existNameField);
      }

      if (!existNameField && notExistNameField) {
        dados = await naoExisteField(page, limit, notExistNameField);

      }

      return res.json({ status: 'sucesso', resultado: dados })
    } catch (e) {
      return res.json({ status: 'erro', message: e.message })
    }
  },
}