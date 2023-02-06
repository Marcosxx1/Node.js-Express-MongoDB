const fs = require("fs");
//Importando express
const express = require("express");
//app agora tem todos os métodos de express
const app = express();
//middleware, função que pode modificar os dados
//de solicitação reebidos, fica entre a solicitação e resposta
app.use(express.json());
const tours = JSON.parse(fs.readFileSync("".concat(__dirname, "/dev-data/data/tours-simple.json")));
//adiciona os dados
/* req = tem os dados necessários */
app.post("/api/v1/tours", function (req, res) {
    // console.log(req.body);
    const newId = tours[tours.length - 1].id + 1; //Calculando a nova ID para o novo POST
    const newTour = Object.assign({ id: newId }, req.body); //copiando a estrutura de tours para newTour
    tours.push(newTour); //Colocando newTour no array de tours, linha 11
    //usando o módulo fs, e o módulo writeFile para escrever no arquivo 'tours.json', JSON.stringify(tours) Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
    fs.writeFile("".concat(__dirname, "/dev-data/data/tours-simple.json"), JSON.stringify(tours), function (_err) {
        //201 = foi ecrito com sucesso
        res.status(201).json({
            status: "success",
            //valor a ser
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
app.listen(3000, function () {
    console.log("Servidor rodando na porta 3000");
});
