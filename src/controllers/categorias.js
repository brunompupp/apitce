const {client, indexCategoria} = require('../configs/elastic');
const moment = require('moment');
moment.locale('pt-br');

async function atualizar(id, status) {
  console.log(id, status)
  let body = await client.update({
    index: indexCategoria,
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
    size: 1000
  });

  return hits.hits
}

async function buscarTodasCategorias() {
  let { hits } = await client.search({
    index: indexCategoria,
    size: 1000,
  });

  let dados = hits.hits;
  let cat = [];

  dados.forEach(categoria => {
    let idElastic;
    let idSql;
    let nome;
    let grupo;
    let status;

    idElastic = categoria._id;
    idSql = categoria._source.id;
    nome = categoria._source.nome;
    status = categoria._source.status;
    grupo = categoria._source.grupo;

    cat.push({ idElastic: idElastic, idSql: idSql, nome: nome, status: status, grupo: grupo })



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


async function criarCategoria(idSql, nome, status, grupo) {
  let body = await client.index({
    index: indexCategoria,
    body: {
      "id": Number(idSql),
      "nome": nome,
      "status": status,
      "grupo": grupo,
      "timestamp": moment().format()
    }
  })

  return body
}


async function buscarCategoriasAtivas() {
  let {hits} = await client.search({
    index: indexCategoria,
    size: 1000,
    body: {
      'query': {
        'bool': {
          "must": [
            {
              'match': {
                'status': true
              }
            }
          ],
          'must_not': [
            {
              'match': {
                'status': false
              }
            }
          ]
        }
      }
    }
  })

  let dados = hits.hits;
  let cat = [];

  dados.forEach(categoria => {
    let idElastic;
    let idSql;
    let nome;
    let grupo;

    idElastic = categoria._id;
    idSql = categoria._source.id;
    nome = categoria._source.nome;
    grupo = categoria._source.grupo;

    cat.push({ idElastic: idElastic, idSql: idSql, nome: nome, grupo: grupo})


  })

  return cat;


}

module.exports = {
  async index(req, res) {
    try {
      let categorias = await buscarCategoriasAtivas();
      return res.json({status: 'sucesso', categorias});

    } catch (e) {
      return res.json({ status: 'erro', message: e.message })
    }
  },

  create(req, res) {
    let { nome } = req.body;

    client.search({
      index: indexCategoria,
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
    let categoriaCriar = [];
    let ids = [];
    try {
      let hits = await buscarCategorias();

      hits.forEach(hit => {
        let categoriaHit = hit._source.nome;
        let idCategoriaHit = hit._id;

        cats.push({ id: idCategoriaHit, nome: categoriaHit, status: hit._source.status });

      })



      function checkCategoria(cat) {
        cats.forEach(cate => {
          if (cate.nome.toUpperCase() === cat.toUpperCase() && cate.status === false) {
            idsAtualizar.push(cate.id)
          } else if (cate.nome.toUpperCase() === cat.toUpperCase()) {
            ids.push(cate.id)
          } else {
            categoriaCriar.push({ nome: cat, status: true, id: hits.length + 1, timestamp: moment().format() })
          }
        })
      }

      categorias.find(checkCategoria);






      cats.forEach(categoria => {

        catAtualizar.push(categoria.id)

      })

      // idsAtualizar = catAtualizar.filter(item => !ids.includes(item));
      catAtualizar = catAtualizar.filter(item => !ids.includes(item))

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

  async listar(req, res) {
    try {
      let categorias = await buscarTodasCategorias();

      return res.json({ status: 'sucesso', categorias });

    } catch (e) {
      return res.json({ status: 'erro', message: e.message })
    }
  },

  async atualizar(req, res) {
    let { categorias } = req.body;

    try {

      categorias.forEach(async categoria => {
        console.log(categoria)
        let id = categoria.idElastic;
        let status = categoria.status;

        if (!status || status === null || status === undefined || status === '') {
          if (status === false) {

          } else {
            status = true

          }
        } else {
          if (status !== false) {
            status = true
          }
        }
        await atualizar(id, status);
      })

      return res.json({ status: 'sucesso', message: 'Categorias atualizadas com sucesso' })
    } catch (e) {
      return res.json({ status: 'erro', message: e.message })
    }
  },
  async criar(req, res) {
    let { idSql, nome, status, grupo } = req.body;
    let message = '';
    try {
      if (!idSql || idSql === null || idSql === undefined || idSql === '') {
        message += 'Informe o id da categoria no Sql. '
      }
      if (!nome || nome === null || nome === undefined || nome === '') {
        message += 'Informe o nome da categoria. '
      }

      if(!grupo || grupo === null || grupo === undefined || grupo === ''){
        message += 'Informe o grupo da categoria. '
      }

      if (message.length > 0) {
        return res.json({ status: 'erro', message: message })
      }

      if (!status || status === undefined || status === null || status === '') {
        if (status === false) {
          status = false
        } else {
          status = true
        }
      }

      let body = await criarCategoria(idSql, nome, status, grupo);

      return res.json({ status: 'sucesso', message: body })
    } catch (e) {
      return res.json({ status: 'erro', message: e.message });
    }
  }




}