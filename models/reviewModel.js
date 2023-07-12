const mongoose= require('mongoose');
const ProductModel = require('./productModel');

const reviewSchema = new mongoose.Schema( {

    title:{
        type: String
    }, 
    ratings :{
        type:Number,
        min:[1 , "Min ratings  value is 1"],
        max:[5 , "Max ratings value is 5.0" ],
        required : [ true ,"review ratings required" ],
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref:"User",
        required: [ true , "Review must belong to user "]
    },
    product :{
        type:mongoose.Schema.ObjectId,
        ref: "Product",
        required: [ true , "Review must be belong to product" ]
    }

}, {timestamps:true} );

 reviewSchema.pre(/^find/ , function (next) {
    this.populate( {path:"user" , select: "name" } );
    next();
 } )


 // Calculate Ratings Quantity And Average

 reviewSchema.statics.calcAverageRatingsAndQuantity = async function( productId) {
      const result = await this.aggregate( [
        // 1 get all reviews in specific product : productId
        { $match: {product:productId} }, 
        //2  grouping reviews with productId and calc avgrating and avgQuantity
        { $group: { _id:"product" , avgRatings: { $avg:"$ratings" } , ratingsQuant:{ $sum: 1 } } },
    ] )

   // console.log(result);
    if( result.length >0 ){
        await ProductModel.findByIdAndUpdate( productId,
             { ratingsAverage: result[0].avgRatings , 
               ratingsQuantity: result[0].ratingsQuant
             }
           )
        // if this product don't have the review 
    } else{
        await ProductModel.findByIdAndUpdate( productId,
            { ratingsAverage: 0 , 
              ratingsQuantity: 0
            }
          )
    }

 }

 // 1 when review save in Db
 reviewSchema.post("save", async function() {
    await this.constructor.calcAverageRatingsAndQuantity(this.product);
 } )

 // 2 when delete review 
 reviewSchema.post("remove", async function() {
    await this.constructor.calcAverageRatingsAndQuantity(this.product);
 } )


module.exports= mongoose.model('Review', reviewSchema )