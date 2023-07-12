const ApiError = require("../utils/apiError");

 const handeljwtInvalidSignature = ()=> {
   new ApiError("Invalid Token , please login again.." , 401);
 }

const gobaleError= (err, req,res,next)=>{
    err.statusCode= err.statusCode || 500;

     res.status(err.statusCode).json({
        error: err,
        message:err.message,
        // stack pour voir Ou se trouve l'error
        //stack: err.stack
     } )

   if(err.name === "TokenExpiredError" ) err= handeljwtInvalidSignature();
}

module.exports= gobaleError