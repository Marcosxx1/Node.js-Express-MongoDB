var fs = require("fs");
//Importando express
var express = require("express");
//app agora tem todos os métodos de express
var app = express();
//middleware, função que pode modificar os dados
//de solicitação reebidos, fica entre a solicitação e resposta
app.use(express.json());
var tours = JSON.parse(fs.readFileSync("".concat(__dirname, "/dev-data/data/tours-simple.json")));
//adiciona os dados
/* req = tem os dados necessários */
app.post("/api/v1/tours", function (req, res) {
    // console.log(req.body);
    var newId = tours[tours.length - 1].id + 1; //Calculando a nova ID para o novo POST
    var newTour = Object.assign({ id: newId }, req.body); //copiando a estrutura de tours para newTour
    tours.push(newTour); //Colocando newTour no array de tours, linha 11
    //usando o módulo fs, e o módulo writeFile para escrever no arquivo 'tours.json', JSON.stringify(tours) Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
    fs.writeFile("".concat(__dirname, "/dev-data/data/tours-simple.json"), JSON.stringify(tours), function (_err) {
        //201 = foi ecrito com sucesso
        res.status(201).json({
            status: "success",
            //valor a ser passado
            data: {
                tour: newTour
            }
        });
    });
});
//implementação do get, pega os dados
app.get("/api/v1/tours", function (req, res) {
    res.status(200).json({
        results: tours.length,
        status: "success",
        data: { tours: tours }
    });
});
//um get para pegar pela id depois do :
//podemos deixar parametros incertos com ?  /:id/:nome?
app.get('/api/v1/tours/:id', function (req, res) {
    console.log(req.params);
    //multiplicar uma string com um numero resulta em um numero
    var id = req.params.id * 1;
    //Implementação do vídeo
    //const tour = tours.find((el: { id: number; }) => el.id === id)
    var tour2 = 0;
    if (id > tours.length) {
        return res.status(404).json({
            status: "fail",
            message: "ID not found"
        });
    }
    //minha implementação
    for (var i = 0; i < tours.length; i++) {
        if (tours[i].id === id) {
            tour2 = tours[i];
        }
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour2: tour2
        }
    });
});
app.listen(3000, function () {
    console.log("Servidor rodando na porta 3000");
});
