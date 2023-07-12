
const mongoose = require('mongoose');

const orderSchema= new mongoose.Schema({

    user: {
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required: [ true ,"Order must be belong to user" ],
    },

    cartItems:[ {

        product:{
            type:mongoose.Schema.ObjectId,
            ref:"Product",
        },

        quantity:Number,
        
        color:String,
        price:Number 
    } ],
    // taxPrice and shippingPrice for admin
    taxPrice:{
        type:Number,
        default:10,
    },
    shippingAdress:{
        details:String,
        phone:String,
        city:String,
        postalCode:String,
    },
    shippingPrice:{
        type:Number,
        default:0,
    },

    totalOrderPrice:{
        type:Number,
    },

    payementMetohdType:{
        type:String,
        enum:["card", "cash"],
        default: "cash",
    },

    isPaid:{
        type:Boolean,
        default:false,
    },

    paidAt:Date,

    isDeliverd: {
        type:Boolean,
        default:false,
    },
    deliverdAt: Date,

}, {timestamps: true })

orderSchema.pre('save', async function (next) {
    this.totalOrderPrice +=this.taxPrice + this.shippingPrice;
})

orderSchema.pre(/^find/, function (next)  {
    this.populate( {path:"user" , select:"name profileImg  email phone" } ).populate( {
        path:"cartItems.product",
        select: "title imageCover category ",
    } )

    next();
} )

module.exports = mongoose.model('Order', orderSchema);