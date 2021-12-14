var express = require('express');  
var app = express();    

const fileUpload = require("express-fileupload")
const methodOverride = require('method-override')
const fs = require("fs")
const mongoose = require('mongoose');

let PDFParser = require("pdf2json");
let XMLHttpRequest = require('xhr2');
const pdfParser = new PDFParser(this, 1);

let LOGIN_ID = ""

// ejs settings
const ejs = require("ejs")
app.set("view engine", "ejs")

// database connection
let MongoClient = require('mongodb').MongoClient;
const { restart } = require('nodemon');
const ObjectIdd =  require("mongodb").ObjectId
let url = "mongodb+srv://admin:admin@cluster0.suejd.mongodb.net/proje3?retryWrites=true&w=majority"

const {db_user, db_pdf_file} = require("./schemas")

let {extract_info_from_pdf} = require("./pdf_extraction")

app.use(express.static("public"))
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())
app.use(fileUpload())
app.use(methodOverride('_method', {
  methods: ["POST", "GET"]
}))

app.get('/', async function (req, res) {  
    await mongoose.connect(url);
    
    res.render("index", {
      alert_flag : false
    });  
});

app.post('/loginCheck', async (req, res) => {
  let a  = await db_user.find({"email" : req.body.email , "password" : req.body.password})
  console.log(a)
  if(a.length > 0){
    LOGIN_ID = a[0]._id
    if(a[0].type == "admin"){
      res.render("admin_pannel")
    }
    else
      res.render("user_panel") 
  }
  else{
    res.render("index", {
      alert_flag : true
    })
  }
  
})

app.post("/add_user_post", async (req, res) => {
  await db_user.create({
    email : req.body.email,
    password: req.body.password,
    type : req.body.user_type
  })
  res.render("admin_pannel")
})

app.get("/delete_user", async (req,res) => {
  res.render("delete_user", {
    alert_flag : false
  })
})

app.get("/edit_user", async (req,res) => {
  res.render("edit_user", {
    alert_flag : false
  })
})


app.post("/edit_user_post", async (req, res) => {
  let a  = await db_user.find({"email" : req.body.email})
  if(a.length == 0){
    res.render("edit_user", {
      alert_flag : true
    })
  }
  else{
    await db_user.findOneAndDelete({email : req.body.email})
    res.render("edit_user_2", {
      body : a[0]
    })
  }
})

app.post("/edit_user_post_2" , async (req, res) => {
  db_user.create({
    email : req.body.email,
    password: req.body.password,
    type : req.body.user_type
  })
  res.render("admin_pannel")
})

app.post("/delete_user_post", async (req, res) => {
  let a  = await db_user.find({"email" : req.body.email})
  if(a.length == 0){
    res.render("delete_user", {
      alert_flag : true
    })
  }
  else{
    await db_user.findOneAndDelete({email : req.body.email})
    res.render("admin_pannel")
  }
})

// Kullanıcı Ekle
app.get("/add_user", (req, res) => {
  res.render("add_user")
})

app.get("/file_upload", (req,res) => {
  res.render("file_upload")
})

app.post("/file_upload_post_2", async(req,res) => {
  console.log(req.body)
  await db_pdf_file.create({
    user_id : LOGIN_ID,
    path : req.body.path,
    student_name : req.body.student_name,
    student_number : req.body.student_number,
    term : req.body.term,
    lesson : req.body.lesson,
    abstract : String(req.body.abstract),
    date : req.body.date,
    keywords : req.body.keywords,
    advisor : req.body.advisor,
    jury1 : req.body.jury1,
    jury2 : req.body.jury2,
    department : req.body.department
  })
  res.render("user_panel")
})

app.post("/file_upload_post", async (req,res) => {
  let pdf = req.files.pdf
  let dir = __dirname + "/public/pdf_files/" + pdf.name 
  pdf.mv(dir, async function(err){
    
    
    let filename = dir.split("").splice(0, dir.length - 4).join("")
    let infos = {}

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
            else if (arrayOfLines[i].split("").splice(0, find.length).join("") == find2) {
                break
            }
            if (flag == true) {
                pageText.push(arrayOfLines[i])
            }
        }
        return pageText
    }

    function searchPattern(line, pattern) {
        if (line.split("").splice(0, pattern.length).join("") == pattern) {
            return [true, line.split("").splice(pattern.length).join("")]
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
            for (let i = 0; i < arrayOfLines.length; i++) {
                arrayOfLines[i] = arrayOfLines[i].slice(0, -1)
            }

            // 4.sayfada isim ve öğrenci no bulduk
            let text = readPage(arrayOfLines, 2, 3)
            let ogrenciNo
            let isim
            let ogretimTuru

            for (let i = 0; i < text.length; i++) {
                let o = searchPattern(text[i], "Öğrenci No:")
                let is = searchPattern(text[i], "Adı Soyadı:")
                let og = searchPattern(text[i], "Öğretim Türü:")
                if (o[0] == true) {
                    ogrenciNo = o[1]
                }
                if (is[0] == true) {
                    isim = is[1]
                }
                if (og[0] == true) {
                    ogretimTuru = og[1]
                }
            }
            infos["student_number"] = ogrenciNo
            infos["student_name"] = isim
            infos["term"] = ogretimTuru

            // 2.sayfada isim ve öğrenci no bulduk
            text = readPage(arrayOfLines, 0, 1)
            let bolum
            let tez_ismi
            let danisman_isim
            let juri1, juri2
            let tarih

            bolum = text[3]
            tez_ismi = text[8]
            if (text[9][0] != ' ') {
                tez_ismi += text[9]
            }
            danisman_isim = text[13]
            juri1 = text[15]
            juri2 = text[17]
            tarih = text[20].split("").splice(24).join("")
            infos["department"] = bolum
            infos["lesson"] = tez_ismi
            infos["advisor"] = danisman_isim
            infos["jury1"] = juri1
            infos["jury2"] = juri2
            infos["date"] = tarih

            // 10.sayfada ozet ve anahtar kelimeleri bulduk
            text = readPage(arrayOfLines, 8, 9)
            let abstract = []
            let keywords
            for (let i = 7; i < 27; i++) {
                if (text[i][0] == " ")
                    break
                abstract.push(text[i])
            }
            keywords = text[27].split("").splice(19).join("")
            if (text[28][0] != " ")
                keywords += text[28]
           
            infos["abstract"] = abstract
            infos["keywords"] = keywords
            infos["path"] = dir
            res.render("file_upload_approval", {
              infos : infos,
              abs : infos.abstract
            })
            
        })
    }, 1000);
  })

})

var server = app.listen(3000, function () {  
  var host = server.address().address;  
  var port = server.address().port;  
  console.log('Example app listening at http://%s:%s', host, port);  
});  