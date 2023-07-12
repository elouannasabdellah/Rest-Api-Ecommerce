
const stripe= require('stripe')(process.env.STRIPE_SECRET);

const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');

const CartModel= require('../models/cartModel');
const OrderModel= require('../models/orderModel');
const ProductModel= require('../models/productModel');
const User = require('../models/userModel');



  // create cash order : /api/v1/orders/cartId
    // @route:   POST
    // @access:  Protected/User

exports.createCashOrder= asyncHandler( async( req, res, next)=>{
    // App settings
    const  taxPrice =0;
    const shippingPrice =0;

    // 1 Get cart depend cartId
    const cart =await CartModel.findById(req.params.cartId);
    if(!cart ){
        return next( new ApiError(` There is no cart with this id:${req.params.cartId} `,404) );
    }

    //2 Get order price depend on cart price "check if coupon apply"
    const cartPrice= cart.totalPriceAfterDiscount ? cart.totalPriceAfterDiscount : cart.totalCartPrie;
     totalOrderPrice=cartPrice + taxPrice + shippingPrice ;
    //totalOrderPrice=cartPrice + OrderModel.taxPrice;
    

    // 3 Create order with default metohd:"cash"
    
    const order= await OrderModel.create( {
        user: req.user._id, 
        cartItems : cart.cartIems,
        shippingAdress:req.body.shippingAdress,
        totalOrderPrice,
    } )
    console.log( order.taxPrice )
    // 4 after craeting Order , decrement product quantity and increment product sold
    if(order){
        
        const bulkOption= cart.cartIems.map( item => ({
            updateOne:{
                filter: { _id:item.product },
                update: { $inc: { quantity: -item.quantity, sold: +item.quantity } }
            }
        } ) );
        await ProductModel.bulkWrite( bulkOption, {} )

          //5 clear cart depend on cartId
        await CartModel.findByIdAndDelete(req.params.cartId);
    }
    
    res.status(201).json({ status:"success" ,message:"order created successfully", data:order });

})

  //  Get all Orders : /api/v1/orders
    // @route:   GET
    // @access:  Protected/User-Admin-manager

exports.findAllOrders= asyncHandler( async (req, res, next)=>{
    // if role ="user" get orders belong the user , if admin | manager get all orders
    let filterObject= {};
    if(req.user.role ==="user" ) filterObject= { user: req.user._id };

    const orders= await OrderModel.find(filterObject );
    res.status(200).json({ status:"success",result:orders.length, data: orders });
} )

  //  Get all Orders : /api/v1/orders/:id
    // @route:   GET
    // @access:  Protected/User-Admin-manager

exports.findSpecificOrder= asyncHandler( async (req, res, next)=>{

    const {id }= req.params;

    const order= await OrderModel.findById(id);
    if(!order){
        next( new ApiError( `No order for this id ${id}`, 404) );
    }
    res.status(200).json({ status:"success", data: order });
} )

  //  Update order paid status: /api/v1/orders/:id/pay
    // @route:   PUT
    // @access:  Protected/Admin

exports.updateOrderPaid= asyncHandler( async(req, res, next)=>{
    const order= await OrderModel.findById(req.params.id);
    if(!order){
        return next( new ApiError(`No order for this user:${req.params.id}`, 404) );
    }

    // updated order to paid
    order.isPaid = true;
    order.paidAt = Date.now();

    const upadated= await order.save();
    res.status(200).json({ status:"success", data:upadated })

} )

  //  Update order Deleverd status: /api/v1/orders/:id/deliver
    // @route:   PUT
    // @access:  Protected/Admin

    exports.updateOrderDeliver= asyncHandler( async(req, res, next)=>{
        const order= await OrderModel.findById(req.params.id);
        if(!order){
            return next( new ApiError(`No order for this user:${req.params.id}`, 404) );
        }
    
        // updated order to delevird
        order.isDeliverd = true;
        order.deliverdAt = Date.now();
    
        const upadatedDeliver = await order.save();
        res.status(200).json({ status:"success", data:upadatedDeliver })
    
    } )

    
  //   Get checkout session from stripe and send it as response : 
    // @route:   GET   /api/v1/orders/checkout-session/:cartId
    // @access:  Protected/User

exports.checkoutSession= asyncHandler( async(req,res, next)=>{

     // 1 Get cart depend cartId
     const cart =await CartModel.findById(req.params.cartId);
     if(!cart ){
         return next( new ApiError(` There is no cart with this id:${req.params.cartId} `,404) );
     }    

    //2 Get order price depend on cart price "check if coupon apply"

    const cartPrice= cart.totalPriceAfterDiscount ? cart.totalPriceAfterDiscount : cart.totalCartPrie;

     const totalOrderPrice=cartPrice   ;

     // 3 Create stripe checkout session

     const session = await stripe.checkout.sessions.create( {
        line_items: [
            // {
            //   name: req.user.name,
            //   amount: cartPrice * 100,
            //   currency: 'usd',
            //   quantity: 1,
            //   description:'session created',
            // },
            {
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: req.user.name,
                  },
                  unit_amount: totalOrderPrice * 100,
                },
                quantity: 1,
              },
          ],
        
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/orders`,
        cancel_url: `${req.protocol}://${req.get('host')}/cart`,
        customer_email: req.user.email,
        client_reference_id : req.params.cartId ,
        metadata: req.body.shippingAdress, 

     } );

     // 4 send session to response
     res.status(200).json( {status:"success" , session} );

} );

 const createCardOrder= async (session)=>{
    const cartId= session.client_reference_id;
    const shippingAdress= session.metadata;
    const orderPrice = session.amount_total / 100;

    const cart= await CartModel.findById(cartId);
    const user= await User.findOne({email:session.customer_email })

    //  // 3 Create order with default metohd:"card"
    const order= await OrderModel.create( {
        user: user._id, 
        cartItems : cart.cartIems,
        shippingAdress,
        totalOrderPrice:orderPrice,
        isPaid:true,
        paidAt:Date.now(),
        payementMetohdType:"card", 
    } )

    if(order){
         // 4 after craeting Order , decrement product quantity and increment product sold
        const bulkOption= cart.cartIems.map( item => ({
            updateOne:{
                filter: { _id:item.product },
                update: { $inc: { quantity: -item.quantity, sold: +item.quantity } }
            }
        } ) );
        await ProductModel.bulkWrite( bulkOption, {} )

          //5 clear cart depend on cartId
        await CartModel.findByIdAndDelete(cartId);
    }

 }

exports.webhookCheckout= asyncHandler( async( req, res ,next)=>{

    const sig = req.headers['stripe-signature'];

    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if(event.type === "checkout.session.completed" ){
        // Create order
        createCardOrder(event.data.object);
    }else{
        res.status(400).json({message:"something is wrong"});
    }
    res.status(200).json({ status:"success", received: true });
} )
// npm cors

// https://dashboard.stripe.com/test/guests/gcus_1NRv5EKSMrM6ajoKsL0wn2SE

//https://app.cyclic.sh/#/app/elouannasabdellah-ecom-api/overview

// https://dashboard.stripe.com/test/webhooks/create