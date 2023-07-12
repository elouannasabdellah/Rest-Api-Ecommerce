
const mongoose= require('mongoose')

//1 Create the Scehma
const categorySchema= new mongoose.Schema({

    name:{
        type:String,
        required: [true, 'Category required'],
        unique: [true, "Category must be unique"],
        minlength: [3, "Too shoort categry"],
        maxlength: [32, "Too long category"]

    }, 

    slug:{
        type:String,
        lowercase: true,
    },

    image:String


}, {timestamps:true})


// 2 Create the model
const CategoryModel= mongoose.model("Category",categorySchema );



module.exports= CategoryModel