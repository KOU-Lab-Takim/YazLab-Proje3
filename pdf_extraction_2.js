const fs = require('fs'),
PDFParser = require("pdf2json");
let XMLHttpRequest = require('xhr2');
const pdfParser = new PDFParser(this, 1);

let filename = "./tez2"

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    fs.writeFile(filename + ".txt", pdfParser.getRawTextContent(), () => { console.log("Done."); });
});

pdfParser.loadPDF(filename + ".pdf");

function readPage(arrayOfLines, pageNum1, pageNum2) {
    let find = "----------------Page (" + String(pageNum1) + ") Break----------------"
    let find2 = "----------------Page (" + String(pageNum2) + ") Break----------------"
    let pageText = []
    let flag = false
    for (let i = 0; i < arrayOfLines.length; i++) {
        if (arrayOfLines[i].split("").splice(0, find.length).join("") == find) {
            flag = true
            continue
        }
        else if(arrayOfLines[i].split("").splice(0, find.length).join("") == find2){
            break
        }
        if(flag == true){
            pageText.push(arrayOfLines[i])
        }
    }
    return pageText
}

function searchPattern(line, pattern){
    if(line.split("").splice(0, pattern.length).join("") == pattern){
        return [true , line.split("").splice(pattern.length).join("")]
    }
    return [false, false]
}

setTimeout(() => {
    let textData

    const promise = new Promise((resolve, reject) => {
        fs.readFile(filename + ".txt", 'utf8', function (err, data) {
            if (err) throw err;
            textData = data
            resolve("cozuldu")
        });
    });

    promise.then(message => {
        let arrayOfLines = textData.split("\n");
        for(let i=0; i<arrayOfLines.length; i++){
            arrayOfLines[i] = arrayOfLines[i].slice(0, -1)
        }

        // 4.sayfada isim ve öğrenci no bulduk
        let text = readPage(arrayOfLines, 2, 3)
        let ogrenciNo
        let isim
        let ogretimTuru

        for(let i=0; i<text.length; i++){
            let o = searchPattern(text[i], "Öğrenci No:")
            let is = searchPattern(text[i], "Adı Soyadı:")
            let og = searchPattern(text[i], "Öğretim Türü:")
            if(o[0] == true){
                ogrenciNo = o[1]
            }            
            if(is[0] == true){
                isim = is[1]
            }
            if(og[0] == true){
                ogretimTuru = og[1]
            }  
        }
        console.log("ogrenci no: " + ogrenciNo)
        console.log("isim:" + isim)
        console.log("ogretim turu:" + ogretimTuru)

        // 2.sayfada isim ve öğrenci no bulduk
        text = readPage(arrayOfLines, 0, 1)
        let bolum
        let tez_ismi
        let danisman_isim
        let juri1, juri2
        let tarih

        bolum = text[3]
        tez_ismi = text[8]
        if(text[9][0] != ' '){
            tez_ismi += text[9]
        }
        danisman_isim = text[13]
        juri1 = text[15]
        juri2 = text[17]
        tarih = text[20].split("").splice(24).join("")
        console.log("Bolum :" + bolum + "\n")
        console.log("Tez İsmi :" + tez_ismi + "\n")
        console.log("Danisman İsmi :" + danisman_isim + "\n") 
        console.log("Juri isimler : " + juri1 + "\n")
        console.log("Juri isimler : " + juri2 + "\n")
        console.log("Tarih :" + tarih + "\n")
        
        // 10.sayfada ozet ve anahtar kelimeleri bulduk
        text = readPage(arrayOfLines, 8, 9)
        let abstract = [] 
        let keywords
        for(let i=7; i<27; i++){
            if(text[i][0] == " ")
                break
            abstract.push(text[i])
        }
        keywords = text[27].split("").splice(19).join("")
        if(text[28][0] != " ")
            keywords += text[28]
        
        console.log("Özet : " + abstract)
        console.log("")
        console.log("Anahtar Kelimeler:" + keywords)
    })
}, 1000);




