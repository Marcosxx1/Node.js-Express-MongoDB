const fs = require('fs');
//Importando express
var express = require('express');
//app agora tem todos os métodos de express
var app = express();

/* app.get('/', function (req, res) {
    res.status(200).json({message: 'Olá do servidor!', app: 'Natours'});
});

app.post('/', (req, res) => {
    res.send('you can post to this endpoint');
})
var port = 3000; */

const tours =JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({
        results: tours.length,
        status: 'success',
        data: {
            tours 
        }
    })
});
app.listen(3000, function () {
    console.log('Servidor rodando na porta 3000');
});
