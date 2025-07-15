const mongoose  = require("mongoose");

const categorieSchema = mongoose.Schema({
    name : String,
    tr : {
        ar : String,
        fr : String
    },
    icon : String
})

module.exports = mongoose.model("Categorie" , categorieSchema)