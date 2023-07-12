
const asyncHandler = require('express-async-handler')
var slugify = require('slugify')
const ApiError= require('../utils/apiError')

const subCategoryModel= require('../models/subCategoryModel');


 exports.setCategoryIdToBody = (req, res , next)=>{

   
      // Nested Route 
      if(!req.body.category) 
             req.body.category= req.params.categoryId;
        next();
 }

 
 exports.createSubCategory= asyncHandler( async(req,res)=>{

    // const name= req.body.name;
    // const category= req.body.category;

   // console.log(req.params)

    const { name,category }= req.body;
 
    //async await 

        const subCategory= await subCategoryModel.create({name, slug:slugify(name) , category});
        res.status(201).json({data:subCategory});

})

  // Nested route 
  //Get   /api/v1/categories/:categoryId/subcategories
   // en va afficher tous les subcategories d'un category  

 exports.getSubCategories= asyncHandler( async(req,res)=>{

    const page= req.query.page * 1 ||1;
    const limit= req.query.limit *1 || 5;
    const skip= (page - 1) * limit

       // console.log(req.params)

        let filterObject= {};
        if(req.params.categoryId) filterObject= { category: req.params.categoryId };

      const subcategories= await subCategoryModel.find( filterObject ).skip(skip).limit(limit)
     // .populate({ path:'category', select:'name ' }).exec();

      res.status(200).json({ results:subcategories.length ,page, data:subcategories})
       
}) ;

    // Get a specific category by id 
    //         /api/v1/categories/:id

    exports.getSubCategory=asyncHandler(async( req, res, next)=>{
        const {id }= req.params;
        const subcategory= await subCategoryModel.findById(id)
        if(!subcategory){
            // res.status(404).json({msg: `No Category for this id ${id}`})
            next( new ApiError( `No Subcategory for this id ${id}`, 404) );
        }

        res.status(200).json({data:subcategory})

    })

    // Update subcategory

    exports.updateSubCategory= asyncHandler( async(req,res, next)=>{
        const {  id}=req.params
        const {name, category }= req.body
    
        const subcategory= await subCategoryModel.findOneAndUpdate({_id:id},
            {name:name, slug:slugify(name ), category } 
            ,{new:true} )
        
        if(!subcategory){
              next( new ApiError(`No Subcategory for this id ${id}`, 404) );
        }
        res.status(200).json({data:subcategory})
     })
    
     // delete subcategory 
    
     exports.deleteSubCategory= asyncHandler( async(req,res, next)=>{
        
        const { id }= req.params
        const subCategory= await subCategoryModel.findOneAndDelete(id)
    
        if(!subCategory){
            // res.status(404).json({msg: `No Category for this id ${id}`})
             next( new ApiError(`No Subcategory for this id ${id}`, 404) );
        }
        res.status(200).send()
    
     } )