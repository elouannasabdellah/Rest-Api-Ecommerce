
const asyncHandler = require('express-async-handler')
const User= require('../models/userModel');


    // add product to wishlist
    // @route : POST /api/v1/wishlist
    // @access: protected/User 

exports.addProductToWishlist=asyncHandler( async (req,res,next)=>{
    // $addToSet : => add product to wishlist array if productId not exist
    const user= await User.findByIdAndUpdate( req.user._id, {
        $addToSet : { wishlist: req.body.productId },

    } , {new:true} );
    
    res.status(200).json({status:"Success", message: "Product added successfuly to your wishlist", 
    data: user.wishlist });

} );

    // remove product from wishlist
    // @route : DELETE /api/v1/wishlist/:productId
    // @access: protected/User 

    exports.removeProductFromWishlist=asyncHandler( async (req,res,next)=>{
        // $pull : => remove product from wishlist array if productId exist
        const user= await User.findByIdAndUpdate( req.user._id, {
            $pull : { wishlist: req.params.productId },
    
        } , {new:true} );
        
        res.status(200).json({status:"Success", message: "Product removed successfuly from your wishlist", 
        data: user.wishlist });
    
    } );

     // remove Get logged user wislist 
    // @route : GET /api/v1/wishlist/
    // @access: protected/User 

    exports.getLoggedUserWishlist= asyncHandler( async (req,res,next)=>{
        const user= await User.findById( req.user._id ).populate('wishlist');

        res.status(200).json( {status:"success",
        result:user.wishlist.length,
        data:user.wishlist } )
    } )