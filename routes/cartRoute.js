
const express= require('express')

const { addProductToCart, getLoggedUserCart,
     removeSpecificCartItem , clearCart,
     updateCartItemQuantity
    , applyCoupon } =require('../services/cartService');
    

const router= express.Router();

const authService = require('../services/authService');

 // /api/v1/cart

router.use(  authService.protect,  authService.allowedTo("user"))

router.route('/')
        .post(addProductToCart ).get(  getLoggedUserCart )
        .delete( clearCart )

 router.put("/applyCoupon", applyCoupon)

router.route("/:itemId").put( updateCartItemQuantity )
    .delete( removeSpecificCartItem )


module.exports= router
