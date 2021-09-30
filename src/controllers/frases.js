const {client, indexObjeto} = require('../configs/elastic');
const moment = require('moment');
moment.locale('pt-br');


async function buscarTodas(page, limit){
  let resp = await client.search({
    index: indexObjeto,
    size: limit,
    from: page
  })

  let { hits } = resp;
  let qtd_hits = hits.total.value;

  let newHits = hits.hits;
  let result = [];

  newHits.map(item => {
    let idElastic = item._id;
    let source = item._source;
    result.push({idElastic, source})

  })

  
  return { pages: Math.round(qtd_hits / limit), qtd_hits, dados: result}

}

async function buscarIdSql(id){
  let {hits} = await client.search({
    index: indexObjeto,
    body: {
      "query":{
        "match": {
          "idSql": id
        }
      }
    }
  });

  if(hits.hits.length > 0){
    let {_source} = hits.hits[0];
    _source.idElastic = hits.hits[0]._id
    return _source

  }else{
    return 'Não encontrou o idSql solicitado'
  }

}

async function buscarIdElastic(id){
  let hits= await client.get({
    index: indexObjeto,
    id:id
  });

  let {_source} = hits;
  _source.idElastic = hits._id
  
  return _source;
}

async function criarObjeto(idSql, dObjeto, modalidade){
  let result = await client.index({
    index: indexObjeto,
    body: {
      "idSql": Number(idSql),
      "dObjeto":dObjeto,
      "modalidade": modalidade,
      "created_at": moment().format() 
    }
  })

  return result;
}

module.exports = {

  async index(req,res){
    let {page, limit, idSql, idElastic} = req.query;
    if (!page || page === "" || page === null || page === undefined) {
      page = 1
    }
    if (!limit || limit === "" || limit === null || limit === undefined) {
      limit = 1000
    }

    limit = Number(limit);
    page = (Number(page) - 1) * limit;

    
    try {
      //chamar funcao de acordo se tiver id ou nao
      if(idElastic){
        let dados = await buscarIdElastic(idElastic);
        return res.json({status:'sucesso', dados})
      }
      
      if(idSql){
        let dados = await buscarIdSql(idSql)
        return res.json({status:'sucesso', dados})
      }
      
      if(!idSql && !idElastic){
        let {pages, qtd_hits, dados} = await buscarTodas(page, limit);
        return res.json({status:'sucesso', pages, qtd_hits,dados})
      }
      
    } catch (e) {
      return res.json({status: 'erro', message: e.message})
    }
  },




  async filter(req,res){
    let {page, limit, ExistNameField, NotExistNameField} = req.query;
    if (!page || page === "" || page === null || page === undefined) {
      page = 1
    }
    if (!limit || limit === "" || limit === null || limit === undefined) {
      limit = 1000
    }

    limit = Number(limit);
    page = (Number(page) - 1) * limit;



    try {
      return res.json({status:'sucesso'})
    } catch (e) {
      return res.json({status: 'erro', message: e.message})
    }
  },



  async show(req,res){
    let {id} = req.params;
    try {
      return res.json({status:'sucesso'})
    } catch (e) {
      return res.json({status: 'erro', message: e.message})
    }
  },
  


  async create(req,res){
    let {idSql, dObjeto, modalidade} = req.body;
    let message='';
    try {
      if(!idSql || idSql === null || idSql === undefined || idSql === ''){
        message += 'Por favor informe idSql. '
      }
      if(!dObjeto || dObjeto === null || dObjeto === undefined || dObjeto === ''){
        message += 'Por favor informe dObjeto. '
      }
      if(!modalidade || modalidade === null || modalidade === undefined || modalidade === ''){
        message += 'Por favor informe modalidade. '
      }

      if(message.length > 0){
        return res.json({status: 'erro', message: message})
      }

      let result = await criarObjeto(idSql, dObjeto, modalidade);

      return res.json({status:'sucesso', result})
    } catch (e) {
      return res.json({status: 'erro', message: e.message})
    }
  },


  async incluir(req,res){
    let {id} = req.params;
    let {nameField, value} = req.body;
    
    try {
      return res.json({status:'sucesso'})
    } catch (e) {
      return res.json({status: 'erro', message: e.message})
    }
  },
  
  async update(req,res){
    let {id} = req.params;
    let {nameField, value} = req.body;

    try {
      return res.json({status:'sucesso'})
    } catch (e) {
      return res.json({status: 'erro', message: e.message})
    }
  },
  
  async delete(req,res){
    let {id} = req.params;
    try {
      return res.json({status:'sucesso'})
    } catch (e) {
      return res.json({status: 'erro', message: e.message})
    }
  },

}