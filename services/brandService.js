
const asyncHandler = require('express-async-handler')
const BrandModel= require('../models/brandModel')
var slugify = require('slugify')
const ApiError= require('../utils/apiError')

const { uploadSingleImage} = require('../middelwares/uploadImageMiddleware');

 exports.getBrands= asyncHandler( async(req,res)=>{

    const page= req.query.page * 1 ||1;
    const limit= req.query.limit *1 || 5;
    const skip= (page - 1)*limit
      const brands= await BrandModel.find({}).skip(skip).limit(limit);
      res.status(200).json({ results:brands.length ,page, data:brands })
       
}) ;

 

    exports.getBrand=asyncHandler(async( req, res, next)=>{
        const {id }= req.params;
        const brand= await BrandModel.findById(id)
        if(!brand){
            // res.status(404).json({msg: `No Category for this id ${id}`})
            next( new ApiError( `No Brand for this id ${id}`, 404) );
        }

        res.status(200).json({data:brand})

    })

 exports.uploadBrandImage= uploadSingleImage("image","brands");

  exports.createBrand= asyncHandler( async(req,res)=>{

    const name= req.body.name;
    req.body.slug= slugify(name);
    req.body.image= req.body.fildename

        const brand= await BrandModel.create( req.body)
        res.status(201).json({data:brand});

})


 exports.updateBrand= asyncHandler( async(req,res, next)=>{
    const {  id}=req.params
    const {name}= req.body
    req.body.slug= slugify(name);
    req.body.image= req.body.fildename
    const brand= await BrandModel.findOneAndUpdate({_id:id},req.body ,{new:true} )
    
    if( !brand ){
          next( new ApiError(`No brand for this id ${id}`, 404) );
    }
    res.status(200).json({data: brand })
 })



 exports.deleteBrand= asyncHandler( async(req,res, next)=>{
    
    const { id }= req.params
    const brand= await BrandModel.findOneAndDelete(id)

    if(!brand){
        // res.status(404).json({msg: `No Category for this id ${id}`})
         next( new ApiError(`No Brand for this id ${id}`, 404) );
    }
    res.status(200).send()

 } )