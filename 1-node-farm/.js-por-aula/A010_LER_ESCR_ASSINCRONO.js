var fs = require('fs');
 fs.readFile('./starter/txt/start.txt', 'utf-8', function (_err, data1) {
    fs.readFile("./starter/txt/".concat(data1, ".txt"), 'utf-8', function (_err, data2) {
        console.log(data2);
        fs.readFile('./starter/txt/append.txt', 'utf-8', function (_err, data3) {
            console.log(data3);
            fs.writeFile('./starter/txt/final.txt', "".concat(data2, "\n").concat(data3), 'utf-8', function (err) {
                console.log('Your file has been written successfully');
            });
        });
    });
});
console.log('Will read file');
