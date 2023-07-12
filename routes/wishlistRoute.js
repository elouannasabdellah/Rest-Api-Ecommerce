

const express= require('express')




const { addProductToWishlist,
    removeProductFromWishlist , 
    getLoggedUserWishlist} = require('../services/wishlistService')


const router= express.Router();

const authService = require('../services/authService');

router.route("/" ).post( 
     authService.protect,
     authService.allowedTo("user"),
     addProductToWishlist )
     .get(  authService.protect,
        authService.allowedTo("user"),
         getLoggedUserWishlist )

router.route('/:productId').delete(   authService.protect,
    authService.allowedTo("user"), removeProductFromWishlist )
   



module.exports= router