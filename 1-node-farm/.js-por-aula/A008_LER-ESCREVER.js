/* module fs nos da acesso a read e write
https://nodejs.org/dist/latest-v18.x/docs/api/fs.html */
var fs = require('fs');
/* (caminho, função)


atribuimos a uma variável a saída da função de leitura*/
var inputTexto = fs.readFileSync('./starter/txt/input.txt', 'utf-8');
console.log(inputTexto);
var textSaida = "This is what we know abou the avocado: ".concat(inputTexto, "\n\nCriado em ").concat(Date.now());
fs.writeFileSync('./starter/txt/output.txt', textSaida, 'utf-8');
console.log('Arquivo foi criado!');
console.log(textSaida);
