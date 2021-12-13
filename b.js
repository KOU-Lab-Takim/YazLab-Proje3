const fs = require('fs'),
PDFParser = require("pdf2json");

const pdfParser = new PDFParser(this,1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {
fs.writeFile("./tez2.txt", pdfParser.getRawTextContent(), ()=>{console.log("Done.");});
});

pdfParser.loadPDF("./tez2.pdf");