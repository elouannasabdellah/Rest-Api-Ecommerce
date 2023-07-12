
const mongoose= require('mongoose')


const subCategorySchema= new mongoose.Schema({

    name:{
        type:String,
        trim:true,
        unique: [ true , "Subcategory must be unique " ],
        minlength:[2, "short subcategory name" ],
        maxlength: [32, "To long Subcategory name" ]
    },
    slug : {
        type:String,
        lowercase:true,
    },  
    category: {
        type:mongoose.Schema.ObjectId,
        ref: "Category",
        required: [true, "Subcategory must be belong to parent category" ]
    },


}, {timestamps :true});

 const subCategoryModel= mongoose.model('Subcategory',subCategorySchema );

 module.exports= subCategoryModel;