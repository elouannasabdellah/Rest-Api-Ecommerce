
const express= require('express')

const { createCoupon,getCoupon,
    getCoupons, updateCoupon,
    deleteCoupon  } =require('../services/couponService')

const router= express.Router();

const authService = require('../services/authService');

// router.use( authService.protect ,authService.allowedTo("user") )

//   /api/v1/coupons

router.route("/" ).post( 
     authService.protect ,
    authService.allowedTo("admin", "manager"),
    createCoupon )
    .get(   authService.protect ,
        authService.allowedTo("admin", "manager"),
         getCoupons )

router.route('/:id').get(   authService.protect ,
    authService.allowedTo("admin", "manager"), getCoupon )
    .put( authService.protect, 
        authService.allowedTo("admin", "manager"),
        updateCoupon )
    .delete(  authService.protect ,
        authService.allowedTo("admin"),
         deleteCoupon )


module.exports= router