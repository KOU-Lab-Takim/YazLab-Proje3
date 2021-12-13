const mongoose = require("mongoose")
const { ObjectId } = require("bson")

exports.db_user = mongoose.model("user", new mongoose.Schema({
    email : String,
    password : String,
    type : String
}))