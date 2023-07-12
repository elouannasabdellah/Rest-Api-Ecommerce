const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');

const CartModel= require('../models/cartModel');
const ProductModel= require('../models/productModel');
const couponModel = require('../models/couponModel');

    // Calculate total cart price
 const calculateTotalPrice= (cart)=>{

    let totalPrice = 0;
    cart.cartIems.forEach( (item)=>{
        totalPrice += item.quantity * item.price 
        cart.totalCartPrie= totalPrice 
        cart.totalPriceAfterDiscount= undefined;
    })

    return totalPrice;
 }

  // add product to cart : /api/v1/cart
    // @route:   POST
    // @access:  Protected/User

exports.addProductToCart= asyncHandler( async( req, res, next)=>{

    const {productId, color}= req.body

    const product= await ProductModel.findById( productId );

    // 1 Get cart for logged user
    let cart= await CartModel.findOne({ user: req.user._id });

    if(!cart){
        // create cart for logged user with product
        cart= await CartModel.create( {
            user: req.user._id,
            cartIems: [ {product: productId, color , price:product.price } ]
        } )
   
    }else {
       // Product exist in cart , => update product quantity 
       const productExist = cart.cartIems.findIndex( 
        (item) =>item.product.toString() ===productId && item.color ===color );
       // console.log(productExist);  RETURN 0 
        if(productExist > -1){
            const cartItem= cart.cartIems[productExist];
            cartItem.quantity +=1;

            cart.cartIems[productExist]= cartItem;

        }else{
            // else product not exist in cart , => push product in cartItems array
            cart.cartIems.push( {product: productId, color , price:product.price } )
        }
  

    }

    // Calculate total cart price
      calculateTotalPrice(cart)

    await cart.save();

    res.status(200).json({ status:"success",
     message:"Product added to cart successfully", 
     numberOfCartItems:cart.cartIems.length,
     data:cart });

} )

  // Get logged user cart :
    // @route:   Get  /api/v1/cart
    // @access:  Protected/User

exports.getLoggedUserCart= asyncHandler( async(req, res, next)=>{

    const cart= await CartModel.findOne({ user: req.user._id })

    if(!cart){
        return next( new ApiError(` There is no cart for this user id :${req.user._id}`, 404) );

    }
    res.status(200).json({ status:"success",
     numberOfCartItems:cart.cartIems.length,
      data:cart });

} )

 // remove specific cart item :
    // @route:   DELETE  /api/v1/cart/:itemId
    // @access:  Protected/User

exports.removeSpecificCartItem= asyncHandler( async(req, res, next)=>{

    const cart= await CartModel.findOneAndUpdate( { user:req.user._id } , {
        $pull: { cartIems: { _id: req.params.itemId } }
    } ,{new: true} )

    calculateTotalPrice(cart);
    cart.save();

    res.status(200).json({ status:"success",
    message:"cart item deleted successfully",
    numberOfCartItems:cart.cartIems.length,
     data:cart });

} )

 //  clear  cart :
    // @route:   DELETE  /api/v1/cart
    // @access:  Protected/User

exports.clearCart= asyncHandler( async(req, res, next)=>{

    await CartModel.findOneAndDelete({ user:req.user._id  });

    res.status(204).json({message:"Cart is clear"});

} )

 // update specific cart item quantity :
    // @route:   PUT  /api/v1/cart/:itemId
    // @access:  Protected/User

exports.updateCartItemQuantity= asyncHandler( async(req, res, next)=>{
       const { quantity} = req.body
    const cart= await CartModel.findOne( {user: req.user._id} )
    if(!cart){
        return next( new ApiError(` there is no cart for this user:${req.user._id} `, 404) );
    }

    const itemIndex= cart.cartIems.findIndex( item => item._id.toString() === req.params.itemId );

    if(itemIndex >-1){
        const cartItem = cart.cartIems[itemIndex];
        cartItem.quantity = quantity ;
        cart.cartIems[itemIndex]= cartItem;
    }else {
        return next( new ApiError( `there is no item for this id:${req.params.itemId }` ) )
    }

     // Calculate total cart price
     calculateTotalPrice(cart)

     await cart.save();

     res.status(200).json({ status:"success",
     numberOfCartItems:cart.cartIems.length,
      data:cart });
      

} )

 // Apply coupon on logged cart :
    // @route:   PUT  /api/v1/cart/applyCoupon
    // @access:  Protected/User

exports.applyCoupon = asyncHandler( async(req, res , next)=>{

    // 1 Get coupon based on coupon name
    const coupon= await couponModel.findOne( {
        name:req.body.coupon , 
        expire:{ $gt: Date.now() } 
    } );

    if(!coupon){
        return next( new ApiError( ` coupon is expired or invalid ` ) );
    }
    
    // 2  Get logged user cart to get totalPrice
    const cart = await CartModel.findOne({ user: req.user._id });

    const totalPrice= cart.totalCartPrie;

    // 3 Calcul total priceAfterDiscount
    const totalPriceAfterDiscount = (totalPrice - (totalPrice * coupon.discount) / 100).toFixed(2); // 3.14

    cart.totalPriceAfterDiscount = totalPriceAfterDiscount;

    await cart.save();

    res.status(200).json({ status:"success",
    numberOfCartItems:cart.cartIems.length,
     data:cart });
     
// 1200 => 1080
} )

