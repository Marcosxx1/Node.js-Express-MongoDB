//Importando express
const express = require('express');
         //app agora tem todos os métodos de express
const app = express();

app.get('/', (req: any, res: any) =>{
    res.status(200).send('Olá do servidor!')
})

const port = 3000;
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});