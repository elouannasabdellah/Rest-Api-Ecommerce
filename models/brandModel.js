
const mongoose= require('mongoose')

//1 Create the Scehma
const brandSchema= new mongoose.Schema({

    name:{
        type:String,
        required: [true, 'Brand required'],
        unique: [true, "Brand must be unique"],
        minlength: [3, "Too shoort Brand"],
        maxlength: [32, "Too long Brand"]

    }, 

    slug:{
        type:String,
        lowercase: true,
    },

    image:String


}, {timestamps:true})


// 2 Create the model
const BrandModel= mongoose.model("Brand",brandSchema );



module.exports= BrandModel