

const asyncHandler = require('express-async-handler')
const User= require('../models/userModel');


    // add adress to user adresses
    // @route : POST /api/v1/adresses
    // @access: protected/User 

exports.addAdress=asyncHandler( async (req,res,next)=>{
    // $addToSet : => add adresses to user adresses array
    const user= await User.findByIdAndUpdate( req.user._id, {
        $addToSet : { addresses: req.body },

    } , {new:true} );
    
    res.status(200).json({status:"Success", message: "adresses added successfuly ", 
    data: user.addresses });

} );

    // remove address from addresses array
    // @route : DELETE /api/v1/adresses/:addressId
    // @access: protected/User 

    exports.removeAddress=asyncHandler( async (req,res,next)=>{
        // $pull : => remove adress from adresses array if adressId exist
        const user= await User.findByIdAndUpdate( req.user._id, {
            $pull : { addresses: { _id: req.params.addressId  } },
    
        } , {new:true} );
        
        res.status(200).json({status:"Success", message: "address removed successfuly ", 
        data: user.addresses });
    
    } );

     // remove Get logged user adresses 
    // @route : GET /api/v1/adresses
    // @access: protected/User 

    exports.getLoggedAddresses= asyncHandler( async (req,res,next)=>{
        const user= await User.findById( req.user._id ).populate('addresses');

        res.status(200).json( {status:"success",
        result:user.addresses.length,
        data:user.addresses } )
    } )
