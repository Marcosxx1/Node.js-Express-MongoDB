const fs = require('fs');
const http = require('http');
const url = require('url');
/* 

////////////////////////////////////////////
///FILES
//BLOCKING SYNCHRONOUS WAY
//readFileSync(caminho do arquivo) para ler arquivos
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8')
console.log(textIn);

//.readFileSync()s
//   .writeFileSync() recebem dois parametros
//   O primeiro é o caminho, o segundo é o arquivo 

const textOut = `Esse é o texto guardado na variável textIn: ${textIn}.\nCriada em ${Date.now()}`;
fs.writeFileSync('./txt/output.txt', textOut);
console.log('Arquivo foi escrito');
*/


//Non-blocking, assynchronous way
/* fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
    fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
        console.log(data2);
        fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
            console.log(data3);

            fs.writeFile('./txt/final.txt',`${data2}\n ${data3}`, 'utf-8', erro =>{
                 console.log('Seu arquivo foi escrito!');
            })
        });
    });
});
console.log('Lendo arquivo'); */



////////////////////////////////////////////
///FILES
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dadosObjeto = JSON.parse(data);

/* .createServer(2 parametros) (requisição e resposta) */
const server = http.createServer((requisicao, resposta) => {
    console.log(requisicao.url);
    const nomeRota = requisicao.url;

    if (nomeRota === '/' || nomeRota === '/overview') {
        resposta.end('Essa é a página OVERVIEW!');
    } else if
        (nomeRota === '/product') {
        resposta.end('Essa é a página PRODUCT!')
    }
    else if (nomeRota === '/api') {
        resposta.writeHead(200, {'Content-type': 'application/json'});
        resposta.end(data);
    }
    else {
        resposta.writeHead(404, {
            'Content-type': 'text/html',
            'my-own-header': 'hello-word'
        });
        resposta.end('<h1>Página não encontrada<h1/>');
    }
});

/* .listen(3 parametros)(1:host, 2:nomeHost, 3: callbackfn) */
server.listen(8000, '127.0.0.1', () => {
    console.log('Esperando por requisições na porta 8000!');
});

