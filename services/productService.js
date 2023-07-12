
const asyncHandler = require('express-async-handler')
var slugify = require('slugify')
const ApiError= require('../utils/apiError')

const ProductModel= require('../models/productModel');
const { json } = require('express');

const { uploadSingleImage} = require('../middelwares/uploadImageMiddleware');

 exports.getProducts= asyncHandler( async(req,res)=>{

   // console.log(req.query);
    //Filter
   const queryStringObj= {...req.query};
   const excludesFields= ["page", "sort","limit", "fields" ];
   excludesFields.forEach((field)=>delete queryStringObj[field] );
    
   // console.log(queryStringObj)

    // Filteration by [gte gt lte lt ]
    let querystr= JSON.stringify(queryStringObj);
    querystr= querystr.replace(/\b(gte|gt|lte|lt)\b/g, match =>`$${match}`);

   // console.log(JSON.parse(querystr));

    // 2 pagination
    const page= req.query.page * 1 ||1;
    const limit= req.query.limit *1 || 5;
    const skip= (page - 1)*limit

    //  { price : {$gte:50} => signifie  >= 50 }

    let mongooseQuery=  ProductModel.find( JSON.parse(querystr) ).skip(skip).limit(limit)
    .populate({path:"category" , select:"name"});

    // 3 Sorting  par exemple filter product by price or ratingAverage
    if(req.query.sort){ 
        // console.log(req.query.sort)
        // ici : pour annuler virgule , 
        const sortBy= req.query.sort.split(",").join(" ");
        // console.log(sortBy);
        mongooseQuery= mongooseQuery.sort(sortBy);
    }else{
        // si n'a pas de sort alors filter by alahdat
        mongooseQuery= mongooseQuery.sort("-createdAt");
    }   

    //4 fields Limiting 
    if(req.query.fields){
        // title, ratingsAverage,imageCover,price
        const fields=req.query.fields.split(",").join(" ")
        // Apres cetter ligne il devien
        // title ratingAverage imageCover price 
        mongooseQuery=mongooseQuery.select(fields)
    }else{
        mongooseQuery=mongooseQuery.select("-__v");
    }

    // Search 
    if(req.query.keyword){
        const query= {};
        query.$or = [
            {title: { $regex:req.query.keyword , $options: "i" } },
            {description: {$regex:req.query.keyword ,$options:"i" } }
        ];
        mongooseQuery=mongooseQuery.find(query)
    }

    // Execute query
      const products = await mongooseQuery ;

      res.status(200).json({ results:products.length ,page, data:products})
       
}) ;
 
    // Get a specific product by id 
    //         /api/v1/products/:id

    exports.getProduct =asyncHandler(async( req, res, next)=>{
        const {id }= req.params;
        const product = await ProductModel.findById(id).populate("reviews");
        if(!product){
            // res.status(404).json({msg: `No Category for this id ${id}`})
            next( new ApiError( `No Product for this id ${id}`, 404) );
        }

        res.status(200).json({data:product})

    })

    // for upload single image Middleware
  exports.uploadProductImage= uploadSingleImage("imageCover","products");

    // Create product @Post   /api/v1/products  
    // @access private

  exports.createProduct= asyncHandler( async(req,res)=>{

    req.body.slug= slugify(req.body.title)
    // req.body.imageCover=req.body.fildename;
    
    //async await 
        const product= await ProductModel.create( req.body);
        res.status(201).json({data : product});

})
 // update Product
 // route =>  PUT /api/v1/products/:id

 exports.updateProduct= asyncHandler( async(req,res, next)=>{
    const {  id}=req.params
   
    if(req.body.title){
        req.body.slug= slugify(req.body.title)
    }
    const product= await ProductModel.findOneAndUpdate({_id:id}, req.body ,{new:true} )
    
    if(!product){
          next( new ApiError(`No Product for this id ${id}`, 404) );
    }
    res.status(200).json({data:product})
 })

 // delete Product 
 //  DELETE =>  /api/v1/products/:id

 exports.deleteProduct = asyncHandler( async(req,res, next)=>{
    
    const { id }= req.params
    const product= await ProductModel.findOneAndDelete(id)

    if(!product){
        // res.status(404).json({msg: `No Category for this id ${id}`})
         next( new ApiError(`No Product for this id ${id}`, 404) );
    }
    res.status(200).send()

 } )