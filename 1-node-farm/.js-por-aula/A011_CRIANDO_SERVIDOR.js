var fs = require('fs');
var http = require('http');
var server = http.createServer(function (requisicao, resposta) {
    resposta.end('Um olá do servidor!');
});
server.listen(8001, '127.0.0.1', function () {
    console.log('Esperando por requisições na porta 8000');
});
