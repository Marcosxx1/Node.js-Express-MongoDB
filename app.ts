const fs = require("fs");
//Importando express
var express = require("express");
//app agora tem todos os métodos de express
var app = express();

//middleware, função que pode modificar os dados
//de solicitação reebidos, fica entre a solicitação e resposta
app.use(express.json());

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);



//função para o get
const getAllTours = (req: any, res: any) => {
    res.status(200).json({
        results: tours.length,
        status: "success",
        data: { tours },
    });
}

const getTour = (req: any, res: any) => {

    //multiplicar uma string com um numero resulta em um numero
    const id = req.params.id * 1;

    //Implementação do vídeo
    //const tour = tours.find((el: { id: number; }) => el.id === id)
    let tour2: number = 0;

    if (id > tours.length) {
        return res.status(404).json({
            status: "fail",
            message: "ID not found"

        });
    }

    //minha implementação
    for (let i = 0; i < tours.length; i++) {
        if (tours[i].id === id) {
            tour2 = tours[i];
        }
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour2
        }
    })
}
//adiciona os dados
/* req = tem os dados necessários */
app.post("/api/v1/tours",);
//cria variável para segurar a função de criar tour
const createTour = (req: any, res: any) => {
    // console.log(req.body);

    const newId = tours[tours.length - 1].id + 1; //Calculando a nova ID para o novo POST
    const newTour = Object.assign({ id: newId }, req.body); //copiando a estrutura de tours para newTour

    tours.push(newTour); //Colocando newTour no array de tours, linha 11

    //usando o módulo fs, e o módulo writeFile para escrever no arquivo 'tours.json', JSON.stringify(tours) Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        (_err: any) => {
            //201 = foi ecrito com sucesso
            res.status(201).json({
                status: "success",
                //valor a ser passado
                data: {
                    tour: newTour,
                },
            });
        }
    );
}

const updateTour = (req: any, res: any) => {
    if (req.params.id > tours.length) {
        return res.status(404).json({
            status: "fail",
            message: "ID not found"
        })
    }


    res.status(200).json({
        status: 'success',
        data: {
            tour: '<Updated toursss>'
        }
    })
}

const deleteTour = (req: any, res: any) => {
    if (req.params.id > 1 * tours.length) {
        return res.status(404).json({
            status: "fail",
            message: "ID not found"
        })
    }

    res.status(204).json({
        status: 'success',
        data: null
    })
}

//implementação do get, pega os dados
//app.get('/api/v1/tours', getAllTours);                ///////////////1

//um get para pegar pela id depois do :
//podemos deixar parametros incertos com ?  /:id/:nome?
//app.get('/api/v1/tours/:id', getTour)                  ///////////////2

//adiciona os dados
/* req = tem os dados necessários */
//app.post("/api/v1/tours", createTour);                 ///////////////3


/* PUT - é esperado que receba o objeto inteiro
   PATCH - algumas propriedades */
//app.patch('/api/v1/tours/:id', updateTour)             ///////////////4

//Deleta tour
//app.delete('/api/v1/tours/:id',deleteTour)             ///////////////5

/* Forma mais prática para definir as rotas
sem repetir muito código */
app.route('/api/v1/tours')
.get(getAllTours)
.post(createTour)

app.route('/api/v1/tours/:id')
.get(getTour)
.patch(updateTour)
.delete(deleteTour)

app.listen(3000, function () {
    console.log("Servidor rodando na porta 3000");
});
