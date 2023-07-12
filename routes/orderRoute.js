
const express= require('express')

 const { createCashOrder, findAllOrders, findSpecificOrder,
    updateOrderPaid , updateOrderDeliver , checkoutSession}= require('../services/orderService');


const router= express.Router();

const authService = require('../services/authService');

//router.use(  authService.protect,  authService.allowedTo("user"))


// /api/v1/orders
// create session for payment card 
router.get('/checkout-session/:cartId' , authService.protect,  authService.allowedTo("user"), checkoutSession)

router.route("/:cartId").post( authService.protect,  authService.allowedTo("user"), createCashOrder )

router.get('/',  authService.protect, authService.allowedTo( "user","admin", "manager"), findAllOrders )
router.get( "/:id" ,  authService.protect,  authService.allowedTo("user"), findSpecificOrder )

// for admin : updated status
  router.put("/:id/pay"  ,authService.protect,  authService.allowedTo("admin"), updateOrderPaid);
  router.put("/:id/deliver"  ,authService.protect,  authService.allowedTo("admin"), updateOrderDeliver);

module.exports= router;