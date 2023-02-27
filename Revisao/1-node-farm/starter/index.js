const fs = require("fs");

/*
//Forma sincrona, bloqueia a execução
 //ler do arquivo json
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
 
//escrever no arquivo json
const textOut = `Isso é o que sabemos do abacate:\n\n${textIn}\n\nO arquivo foi lido em: \n${Date.now()}`

console.log(textOut)
fs.writeFileSync('./txt/output.txt', textOut);

 */

fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
	fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
		console.log(data2);
		fs.readFile("./txt/append.txt", "utf-8", (err, data3) => {
			console.log(data3);

			fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", err => {});
		});
	});
});
console.log("Lendo o arquivo");
