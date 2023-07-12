

const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema( {

    cartIems:[ {

        product:{
            type:mongoose.Schema.ObjectId,
            ref:"Product",
        },

        quantity: {
            type:Number,
            default: 1,
        },
        
        color:String,
        price:Number 
    } ],
     
   totalCartPrie:Number,
   totalPriceAfterDiscount: Number,

   user: {
        type:mongoose.Schema.ObjectId,
        ref:"User",
    }

}, {timestamps: true} )

 module.exports = mongoose.model( "Cart", cartSchema );