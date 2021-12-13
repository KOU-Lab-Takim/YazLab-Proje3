const fs = require("fs");
const pdf = require("pdf-parse");

async function pdf_parser() {
  let dataBuffer = fs.readFileSync("./1.pdf");

  pdf(dataBuffer)
    .then(function (data) {
      console.log(data.text)
    })
    .catch(function (error) {
      // handle exceptions
    });

}
pdf_parser()