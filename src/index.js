require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const porta = process.env.PORT || 3336
const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(morgan('dev'));
app.use(cors());

const index = require('./routes/index');
const search = require('./routes/search');
const score = require('./routes/score');
const categorias = require('./routes/categorias');
const frases = require('./routes/frases');
const filtrar = require('./routes/filtrar');
const keywords = require('./routes/keywords');

app.use('/', index);
app.use('/search', search);
app.use('/score', score);
app.use('/categorias', categorias);
app.use('/frases', frases);
app.use('/filtrar', filtrar);
app.use('/keywords', keywords);


app.listen(porta, ()=>{
  console.log('api rodando')
})