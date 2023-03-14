const fs = require("fs");
const http = require("http");
const url = require("url");
const replaceTemplate = require('../modules/replaceTemplate')

 
const tempOverview = fs.readFileSync(
	`./templates/template-overview.html`,
	"utf-8"
);
const tempCard = fs.readFileSync(
	`./templates/template-card.html`,
	"utf-8"
);
const tempProduct = fs.readFileSync(
	`${__dirname}/templates/template-product.html`,
	"utf-8"
);   

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");

const dataObj = JSON.parse(data);

const server = http.createServer((req, res) => {
  const myURL = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = myURL;
  const id = myURL.searchParams.get('id');
 
 
	//overview
	if (pathname === "/" || pathname === "/overview") {
		res.writeHead(200, { "Content-type": "text/html" });

		const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');
		const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml)
		res.end(output);
	}

	//product
	else if (pathname === "/product") {
		res.writeHead(200, {'Content-type': 'text/html'})
		const product = dataObj[id];
		const output = replaceTemplate(tempProduct, product);
 		res.end(output);
	}

	//API
	else if (pathname === "/api") {
		res.writeHead(200, { "Content-type": "application.json" });
		res.end(data);
	}
	//NOT FOUND
	else {
		res.writeHead(400, {
			"Contet-type": "text/html",
			"my-own-header": "hello-world",
		});
		res.end("Page not found");
	}
});

server.listen(3000, "127.0.0.1", () => {
	console.log("Server running on port 3000!");
});
