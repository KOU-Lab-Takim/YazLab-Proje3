var express = require('express');  
var app = express();    

const fileUpload = require("express-fileupload")
const methodOverride = require('method-override')
const fs = require("fs")
const mongoose = require('mongoose');

// ejs settings
const ejs = require("ejs")
app.set("view engine", "ejs")

// database connection
let MongoClient = require('mongodb').MongoClient;
const { restart } = require('nodemon');
const ObjectIdd =  require("mongodb").ObjectId
let url = "mongodb+srv://admin:admin@cluster0.suejd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

const {db_user} = require("./schemas")

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
    
    res.render("index");  
});  

var server = app.listen(8000, function () {  
  var host = server.address().address;  
  var port = server.address().port;  
  console.log('Example app listening at http://%s:%s', host, port);  
});  