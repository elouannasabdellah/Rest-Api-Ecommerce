
const asyncHandler = require('express-async-handler');
const CouponModel= require('../models/couponModel');
const ApiError = require('../utils/apiError');

    // create coupon : /api/v1/coupons
    // POST
    // @access:  Private/admin-manager

exports.createCoupon= asyncHandler( async(req,res,next)=>{

    const coupon= await CouponModel.create( req.body );

    res.status(201).json({ data: coupon })

} )
  // get coupon : /api/v1/coupons/:id
    // GET
    // @access:  Private/admin-manager

exports.getCoupon= asyncHandler( async(req, res, next)=>{

    const {id}= req.params;
    const coupon= await CouponModel.findById(id)
    if(!coupon){
        
        return next( new ApiError( `No coupon for this id ${id}`, 404) );
    }
    res.status(200).json( {data:coupon });
} )

    // create coupon : /api/v1/coupons
    // GET
    // @access:  Private/admin-manager

exports.getCoupons= asyncHandler( async(req, res, next)=>{

    const {id}= req.params;
    const coupons= await CouponModel.find({})

    res.status(200).json( {data:coupons });
} )

      // UPDATE  coupon by id : /api/v1/coupons/:id
    //  PUT
    // @access:  Private/admin-manager

exports.updateCoupon= asyncHandler( async(req, res, next)=>{

    const {  id}=req.params;

    const coupon= await CouponModel.findByIdAndUpdate( {_id:id}, req.body, {new: true} );
    if(!coupon ){
        return next( ApiError( ` No coupon for this id:${id}`, 404 ) )
    }

    res.status(200).json({message:"coupon updated successfuly", data: coupon});

} )

        // DELETE  coupon by id : /api/v1/coupons/:id
    //  DELETE
    // @access:  Private/admin

exports.deleteCoupon= asyncHandler( async(req,res, next)=>{
    
    const { id }= req.params
    const coupon= await CouponModel.findOneAndDelete(id)

    if(!coupon){
        // res.status(404).json({msg: `No Category for this id ${id}`})
       return next( new ApiError(` No coupon for this id:${id}` , 404) );
    }
    res.status(200).json({ status:"Success", message:"coupon deleted" });

 } )