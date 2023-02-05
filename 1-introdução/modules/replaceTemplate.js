"use strict";
module.exports = (temporario, produto) => {
    let saida = temporario.replace(/{%PRODUCTNAME%}/g, produto.productName);
    saida = saida.replace(/{%IMAGE%}/g, produto.image);
    saida = saida.replace(/{%FROM%}/g, produto.from);
    saida = saida.replace(/{%NUTRIENTS%}/g, produto.nutrients);
    saida = saida.replace(/{%QUANTITY%}/g, produto.quantity);
    saida = saida.replace(/{%DESCRIPTION%}/g, produto.description);
    saida = saida.replace(/{%PRICE%}/g, produto.price);
    saida = saida.replace(/{%ID%}/g, produto.id);
    if (!produto.organic)
        saida = saida.replace(/%NOT_ORGANIC%/g, 'not-organic');
    return saida;
};
