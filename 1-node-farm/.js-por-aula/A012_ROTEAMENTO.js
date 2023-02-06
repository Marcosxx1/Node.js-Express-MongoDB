/* 12. Routing */
var fs = require('fs');
var http = require('http');
var url = require('url');
var server = http.createServer(function (requisicao, resposta) {
    var nomeCaminho = requisicao.url;
    if (nomeCaminho === '/' || nomeCaminho === '/overview') {
        resposta.end('Essa eh a pagina OVERVIEW');
    }
    else if (nomeCaminho === '/product') {
        resposta.end('Essa é a página PRODUCT');
    }
    else {
        resposta.writeHead(404, {
            //header = é parte de uma informação que estamos mandando de volta
            'Content-Type': 'text/html',
            'my-own-header': 'hello-world'
        });
        resposta.end('<p>Pagina nao encontrada</p>');
    }
});
server.listen(8000, '127.0.0.1', function () {
    console.log('Esperando por requisições na porta 8000');
});
