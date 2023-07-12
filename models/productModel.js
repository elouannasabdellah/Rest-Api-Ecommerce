
const mongoose= require('mongoose');

const productSchema= new mongoose.Schema( {

    title:{
        type:String,
        required: true,
        trim:true,
        minlength: [3 , "Too shoort product title" ],
        maxlength: [ 100, "Too long product title" ]
    },

    slug: {
        type:String,
        required: true,
        lowercase: true, 
    },

    description: {
        type:String,
        required: true,
        minlength: [ 20, "Too short product description" ],
    
    },

    quantity: {
        type: Number,
        required : [ 20 , "Product quantity is required"],
    },

    sold: {
        type:Number,
        default: 0,
    },

    price:{
        type:Number,
        required: [true, "product price is required" ],
        trim: true,
        max: [2000000, "Too long product price"]
    },

    priceAfterDisCount: {
        type:Number,

    },

    colors: [String],

    imageCover: {
        type:String,
        required: [true, "Product Image Cover is required" ],
    },

    images: [String],

    category: {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
        required: [ true, "Product must be belong to category" ]
    },

    subcategory: [
        {
        type:mongoose.Schema.ObjectId,
        ref: "Subcategory",

       }
    ],

    brand: {
        type:mongoose.Schema.ObjectId,
        ref: "Brand",
    },

    ratingsAverage: {
        type:Number,
        min: [ 1, " Rating must be above or equal 1.0 " ],
        max: [ 5, "Rating must be below or equal 5.0 " ]
    },

    ratingsQuantity:{
        type:Number,
        default:0,
    },
 

} , {timestamps:true , 
    // to virtual reviews populate
    toJSON:{virtuals: true},
    toObject : {virtuals: true}, 
    });

 productSchema.virtual("reviews" , {
    ref:"Review",
    foreignField:"product",
    localField:"_id",

 } )

module.exports= mongoose.model('Product', productSchema )