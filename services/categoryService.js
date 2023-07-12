
const asyncHandler = require('express-async-handler')
const CategoryModel= require('../models/categoryModel')
var slugify = require('slugify')
const ApiError= require('../utils/apiError')

// for upload file
const multer  = require('multer');
const { v4: uuidv4 } = require('uuid');

const { uploadSingleImage} = require('../middelwares/uploadImageMiddleware');


// upload single image

// const multerStorage= multer.diskStorage({

//     destination: function (req, file, cb) {
//         cb(null, 'uploads/categories')
//       },

//       filename: function(req, file, cb ){
//         const ext= file.mimetype.split("/")[1];
//         const filename= `category-${uuidv4()}-${Date.now()}.${ext}`;
//         cb(null, filename);
        
//         req.body.image= filename
//       }
 

// });

// const multerFilter= function(req, file, cb ){
//     //image/jpg
//     if(file.mimetype.startsWith("image") ){
//         cb(null, true )
//     }else{
//         cb( new ApiError("Only images allowed", 400), false );
//     }
// }

// const upload= multer({ storage: multerStorage, fileFilter:multerFilter })

 exports.uploadCategoryImage= uploadSingleImage("image","categories");

 exports.getCategories= asyncHandler( async(req,res)=>{

    const page= req.query.page * 1 ||1;
    const limit= req.query.limit *1 || 5;
    const skip= (page - 1)*limit
      const categories= await CategoryModel.find({}).skip(skip).limit(limit);
      res.status(200).json({ results:categories.length ,page, data:categories})
       
}) ;

    // Get a specific category by id 
    //         /api/v1/categories/:id

    exports.getCategory=asyncHandler(async( req, res, next)=>{
        const {id }= req.params;
        const category= await CategoryModel.findById(id)
        if(!category){
            // res.status(404).json({msg: `No Category for this id ${id}`})
            next( new ApiError( `No Category for this id ${id}`, 404) );
        }

        res.status(200).json({data:category})

    })

    // Create category @Post   /api/v1/categories  
    // @access private

  exports.createCategory= asyncHandler( async(req,res)=>{

    const name= req.body.name;
    req.body.slug= slugify(name);
    const {image}= req.body
    req.body.image= req.body.fildename
    //async await 
        const category= await CategoryModel.create(req.body);
        res.status(201).json({data:category});

})

// Update category by id 
// private

 exports.updateCategory= asyncHandler( async(req,res, next)=>{
    const {  id}=req.params
   
    const {name}= req.body
    req.body.slug= slugify(name);
    req.body.image= req.body.fildename

    const category= await CategoryModel.findOneAndUpdate({_id:id},req.body ,{new:true} )
    
    if(!category){
        return next( new ApiError(`No Category for this id ${id}`, 404) );
    }
    res.status(200).json({data:category})
 })

 // delete category 
 // private

 exports.deleteCategory= asyncHandler( async(req,res, next)=>{
    
    const { id }= req.params
    const category= await CategoryModel.findOneAndDelete(id)

    if(!category){
        // res.status(404).json({msg: `No Category for this id ${id}`})
       return next( new ApiError(`No Category for this id ${id}`, 404) );
    }
    res.status(200).send()

 } )
