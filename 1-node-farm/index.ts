/* 13. Building a (Very) Simple API */
//const fs = require('fs');
const http = require('http');
const url = require('url');


/* Código aqui é executado apenas uma vez, assim que é executado */
const tempOverview = fs.readFileSync(`${__dirname}/starter/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/starter/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/starter/templates/template-product.html`, 'utf-8');


const data = fs.readFileSync(`${__dirname}/starter/dev-data/data.json`, 'utf-8');
const dadoObjeto = JSON.parse(data);


const server = http.createServer((requisicao: { url: any; }, resposta: any) => {

    const nomeCaminho = requisicao.url;

    //Página overview
    if (nomeCaminho === '/' || nomeCaminho === '/overview') {
        //                      tipo conteudo      o que sera mostrado
        resposta.writeHead(200, {'Content-Type' : 'text/html'});
        console.log(tempOverview);
        resposta.end(tempOverview);

    //Página product
    } else if (nomeCaminho === '/product') {
        resposta.end('Essa é a página PRODUCT');

    //Página API
    } else if (nomeCaminho === '/api') {
        resposta.writeHeader(200, { 'Content-Type': 'application/json' });
        resposta.end(data);//.END SÓ UMA VEZ!!!!!       
    }

    else {

        //Erros
        resposta.writeHead(404, {
            //header = é parte de uma informação que estamos mandando de volta
            'Content-Type': 'text/html',
            'my-own-header': 'hello-world'
        });
        resposta.end('<p>Pagina nao enontrada</p>');
    }

})

server.listen(8000, '127.0.0.1', () => {
    console.log('Esperando por requisições na porta 8000');
});
