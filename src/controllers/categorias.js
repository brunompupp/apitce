require('dotenv').config();
const elasticsearch = require('elasticsearch');
const moment = require('moment');
const client = new elasticsearch.Client({
  host: process.env.ELASTIC

});
moment.locale('pt-br');
let index = 'categorias-tce';

async function atualizar(id, status) {
  console.log(id, status)
  let body = await client.update({
    index,
    id: id,
    body: {
      doc: {
        status: status
      }
    }
  })

  return body.result
}

async function buscarCategorias() {
  let { hits } = await client.search({
    index,
  });

  return hits.hits
}

async function buscarTodasCategorias() {
  let { hits } = await client.search({
    index,
  });

  let dados = hits.hits;
  let cat=[];

  dados.forEach(categoria=>{
    let idElastic;
    let idSql;
    let nome;
    let status;

    idElastic = categoria._id;
    idSql = categoria._source.id;
    nome = categoria._source.nome;
    status = categoria._source.status;
    
    cat.push({idElastic:idElastic, idSql:idSql, nome:nome, status:status})



  })

  return cat;
}


async function atualizarFalse(cats) {
  cats.forEach(async cate => {
    await atualizar(cate, false);
  })

  return true
}

async function atualizarTrue(ids) {
  ids.forEach(async id => {
    await atualizar(id, true);
  })

  return true
}


async function criarCategoria(idSql, nome, status){
  let body = await client.index({
    index: index,
    body: {
      "id": idSql,
      "nome": nome,
      "status": status,
      "timestamp": moment().format()
    }
  })

  return body
}

module.exports = {
  index(req, res) {
    try {


      client.search({
        index,
        // body: {
        //   'query': {
        //     'bool': {
        //       "must": [
        //         {
        //           'match': {
        //             'status': true
        //           }
        //         }
        //       ],
        //       'must_not': [
        //         {
        //           'match': {
        //             'status': false
        //           }
        //         }
        //       ]
        //     }
        //   }
        // }
      }, function (err, resp, status) {
        if (err) {
          return res.json({ status: 'erro', message: err });

        } else {
          const { hits } = resp;
          return res.json({ status: 'sucesso', hits });

        }

      })
    } catch (e) {
      return res.json({ status: 'erro', message: e.message })
    }
  },

  create(req, res) {
    let { nome } = req.body;

    client.search({
      index,
    }, function (err, resp, status) {
      if (err) {
        console.log(err)
        return 'erro'
      }


      const { hits } = resp;

      const { total } = hits;
      client.index({
        index: index,
        body: {
          "id": total.value + 1,
          "nome": nome,
          "status": true,
          "timestamp": moment().format()
        }
      }, function (err, resp, status) {
        console.log(resp, err, status)
        if (err) {
          return res.json({ status: 'erro', message: err })
        } else {
          return res.json({ status: 'sucesso', resp })
        }
      })

    })
  },

  async update(req, res) {

    let { categorias } = req.body;

    categorias = ['Pavimentacao', 'Escolar', 'alguma ai', 'TesteCriar'];
    let cats = [];
    let catAtualizar = [];
    let idsAtualizar = [];
    let categoriaCriar=[];
    let ids = [];
    try {
      let hits = await buscarCategorias();

      hits.forEach(hit => {
        let categoriaHit = hit._source.nome;
        let idCategoriaHit = hit._id;

        cats.push({ id: idCategoriaHit, nome: categoriaHit, status:hit._source.status });

      })



      function checkCategoria(cat) {
        cats.forEach(cate => {
          if (cate.nome.toUpperCase() === cat.toUpperCase() && cate.status === false) {
            idsAtualizar.push(cate.id)
          }else if(cate.nome.toUpperCase() === cat.toUpperCase()){
            ids.push(cate.id)
          }else{
            categoriaCriar.push({nome: cat, status: true, id: hits.length + 1, timestamp: moment().format()})
          }
        })
      }

      categorias.find(checkCategoria);






      cats.forEach(categoria =>{

          catAtualizar.push(categoria.id)

      })

      // idsAtualizar = catAtualizar.filter(item => !ids.includes(item));
      catAtualizar = catAtualizar.filter(item=> !ids.includes(item))

      // console.log(ids);
      //console.log('cats', catAtualizar)
      //console.log('ids', idsAtualizar);

      console.log(categoriaCriar)

      let statusCats = await atualizarFalse(catAtualizar);

      let statusIds = await atualizarTrue(idsAtualizar);



      return res.json({ statusCats, statusIds })
      // return res.json('ok')


    } catch (e) {
      return res.json({ status: 'erro', message: e.message })
    }
  },

  async delete(req, res) {

    try {
      const categorias = [
        'EDJI8HsB5BSzYC81HIKw',
        '7TJW8HsB5BSzYC81XI6P',
        'BzJJ8HsB5BSzYC81d4OX',
        'ETIz8HsB5BSzYC81i2OU'
      ];


      let statusCats = await atualizarFalse(categorias);
      return res.json(statusCats)

    } catch (error) {
      return res.json(error)
    }



  },

  async listar(req,res){
    try {
      let categorias = await buscarTodasCategorias();

      return res.json({status: 'sucesso', categorias});

    } catch (e) {
      return res.json({status: 'erro', message:e.message})
    }
  },

  async atualizar(req,res){
    let {categorias} = req.body;

    try {

      categorias.forEach(async categoria=>{
        console.log(categoria)
        let id = categoria.idElastic;
        let status = categoria.status;
        
        if(!status || status ===null || status === undefined || status ===''){
          if(status === false){

          }else{
            status = true

          }
        }
        await atualizar(id, status);
      })

      return res.json({status: 'sucesso', message: 'Categorias atualizadas com sucesso'})
    } catch (e) {
      return res.json({status: 'erro', message: e.message})
    }
  },
  async criar(req,res){
    let {idSql, nome, status} = req.body;
    let message='';
    try {
      if(!idSql || idSql === null || idSql===undefined || idSql===''){
        message+= 'Informe o id da categoria no Sql. '
      }
      if(!nome || nome === null || nome === undefined || nome ===''){
        message += 'Informe o nome da categoria. '
      }

      if(message.length >0){
        return res.json({status: 'erro', message: message})
      }

      if(!status || status === undefined || status === null || status === ''){
        if(status === false){
          status = false
        }else{
          status = true
        }
      }

      let body = await criarCategoria(idSql, nome, status);

      return res.json({status: 'sucesso', message: body})
    } catch (e) {
      return res.json({status: 'erro', message: e.message});
    }
  }




}