"use strict";
const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');
const trocaTeplate = require('./modules/replaceTemplate');
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
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduto = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dadosObjeto = JSON.parse(data);
const slugs = dadosObjeto.map((elemento) => slugify(elemento.productName));
console.log(slugs);
/* .createServer(2 parametros) (requisição e resposta) */
const server = http.createServer((requisicao, resposta) => {
    const { query, pathname } = url.parse(requisicao.url, true);
    // console.log(url.parse(requisicao.url, true));
    //Pagina Overview  
    if (pathname === '/' || pathname === '/overview') {
        resposta.writeHead(200, { 'Content-type': 'text/html' });
        const cardsHTML = dadosObjeto.map((elemento) => trocaTeplate(tempCard, elemento)).join('');
        const saida = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHTML);
        resposta.end(saida);
    }
    else 
    //Pagina product
    if (pathname === '/product') {
        resposta.writeHead(200, { 'Content-type': 'text/html' });
        const product = dadosObjeto[query.id];
        const saida = trocaTeplate(tempProduto, product);
        resposta.end(saida);
    }
    else 
    //Pagina api
    if (pathname === '/api') {
        resposta.writeHead(200, { 'Content-type': 'application/json' });
        resposta.end(data);
    }
    else {
        //Erro!
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
