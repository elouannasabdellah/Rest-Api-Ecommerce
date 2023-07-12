
const asyncHandler = require('express-async-handler')
const ReviewModel= require('../models/reviewModel')
var slugify = require('slugify')
const ApiError= require('../utils/apiError');

        // GET /api/v1/reviews
    // Access  Public

 exports.getReviews= asyncHandler( async(req,res)=>{

    const page= req.query.page * 1 ||1;
    const limit= req.query.limit *1 || 5;
    const skip= (page - 1)*limit

    // Nested Route
    let filterObject= {};
    if(req.params.productId) filterObject= { product: req.params.productId };

      const reviews= await ReviewModel.find( filterObject ).skip(skip).limit(limit);
      res.status(200).json({ results:reviews.length ,page, data:reviews })
       
}) ;

        // GET /api/v1/reviews/:id
    // Access  Public

 exports.getReview=asyncHandler(async( req, res, next)=>{
        const {id }= req.params;
        const review= await ReviewModel.findById(id)
     

        res.status(200).json({data:review})

    })

    // Nested Route  POST /api/v1/products/productId/reviews
    exports.setProductIdAndUserIdToBody = (req, res , next)=>{
   
        // Nested Route 
        if(!req.body.product) 
               req.body.product= req.params.productId;
        if(!req.body.user) 
               req.body.user= req.user._id;
          next();
   }

    // POST /api/v1/reviews
    // Access  Private/protected/User

  exports.createReview= asyncHandler( async(req,res)=>{

    const title= req.body.title;
    req.body.slug= slugify(title);

        const review= await ReviewModel.create( req.body)
        res.status(201).json({data:review});

})

     // PUT /api/v1/reviews/:id
    // Access  Private/protected/User

 exports.updatereview= asyncHandler( async(req,res, next)=>{
    const {  id}=req.params
    // const {title}= req.body
    // req.body.slug= slugify(title);
   
    const review= await ReviewModel.findOneAndUpdate({_id:id},req.body ,{new:true} )
    
    if( !review ){
          next( new ApiError(`No review for this id ${id}`, 404) );
    }
    // Trigger "save" when update : save in reviewModel
    review.save();
    res.status(200).json({data: review })
 })

  // POST /api/v1/reviews
    // Access  Private/protected/User-Admin-manager

 exports.deletereview= asyncHandler( async(req,res, next)=>{
    
    const { id }= req.params
    const review= await ReviewModel.findOneAndDelete(id)

    if(!review){
        // res.status(404).json({msg: `No Category for this id ${id}`})
         next( new ApiError(`No Review for this id ${id}`, 404) );
    }
     // Trigger "save" when delete : save in reviewModel
     review.remove();
    res.status(200).send()

 } )