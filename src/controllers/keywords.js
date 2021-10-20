const { client, indexObjeto } = require('../configs/elastic');
const moment = require('moment');
moment.locale('pt-br');


async function buscarKeywords(classificacao, field) {

  let resp = await client.search({
    index: indexObjeto,
    body: {
      "query": {

        "bool": {
          "must": [{ "match": { "categoria": classificacao } }],
          "filter": [{ "exists": { "field": field } }]
        }

      }
    }

  });
  let { hits } = resp.hits;
  let newHits = []

  hits.forEach(hit => {
    let keys = hit._source.keywords;
    let words = [];
    if (keys) {
      try {
        words = keys.split(',')

      } catch (error) {
        words = [keys]
      }
      words.forEach(word => newHits.push(word.trim()))

    }

  })

  return newHits
}

async function buscarSemClassificacao(keywords, page, limit) {

  let resp = await client.search({
    index: indexObjeto,
    size: limit,
    from: page,
    body: {
      "query": {
        "bool": {
          "must": [{"match": { "dObjeto": keywords }}], 
          "filter": {"bool": {"must_not": [{ "exists": { "field": "categoria" } }] }}
        }
      }
    }
  })


  let {hits} = resp.hits;
  let qtd_hits = resp.hits.total.value;

  let newHits = [];
  hits.forEach(hit => {
    let idElastic = hit._id;
    let score = hit._score;

    newHits.push({idElastic, score})



  })

  return {pages: Math.round(qtd_hits / limit), qtd_hits, newHits}
}

module.exports = {
  async index(req, res) {
    let { classificacao, field } = req.body;
    let message = '';
    if (!classificacao || classificacao === undefined || classificacao === null || classificacao === '') {
      message += 'Por favor informe a classificação. '
    }

    if (!field || field === undefined || field === null || field === '') {
      message += 'Por favor informe o field. '
    }

    try {
      if (message.length > 0) {
        return res.json({ status: 'erro', message: message })
      }

      let keywords = [];
      let keys = []
      for (let i = 0; i < classificacao.length; i++) {
        keys = await buscarKeywords(classificacao[i], field);

        for (let j = 0; j < keys.length; j++) {
          keywords.push(keys[j])
        }

      }
      return res.json({ status: 'sucesso', keywords })
    } catch (e) {
      return res.json({ status: 'erro', message: e.message })
    }
  },

  async show(req, res) {
    let { keywords, page, limit } = req.body;

    if (!page || page === "" || page === null || page === undefined) {
      page = 1
    }
    if (!limit || limit === "" || limit === null || limit === undefined) {
      limit = 1000
    }

    limit = Number(limit);
    page = (Number(page) - 1) * limit;


    if (!keywords || keywords === null || keywords === undefined || keywords === '') {
      return res.json({ status: 'erro', message: 'Por favor informe as Keywords.' })
    }


    try {

      let resp = await buscarSemClassificacao(keywords, page, limit)
      let dados = resp.newHits;
      let {pages, qtd_hits} = resp;


      return res.json({ status: 'sucesso', pages, qtd_hits, dados })
    } catch (e) {
      return res.json({ status: 'erro', message: e.message })
    }

  }
}