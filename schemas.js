const mongoose = require("mongoose")
const { ObjectId } = require("bson")

exports.db_user = mongoose.model("user", new mongoose.Schema({
    email : String,
    password : String,
    type : String
}))

exports.db_pdf_file = mongoose.model("pdf_file", new mongoose.Schema({
    user_id : String,
    path : String,
    student_name : String,
    student_number : String,
    term : String,
    lesson : String,
    abstract : String,
    date : String,
    header : String,
    keywords : String,
    advisor : String,
    jury1 : String,
    jury2 : String,
    department : String
}))