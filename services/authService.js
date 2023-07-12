
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const asyncHandler = require('express-async-handler')
const User= require('../models/userModel');
const ApiError= require('../utils/apiError')
const sendEmail = require('../utils/sendEmail')

const createToken = (payload) =>{

  return jwt.sign( {userId: payload},  process.env.JWT_SECRET_KEY, 
    { expiresIn: process.env.JWT_EXPIRE_TIME }
    )

};

// @desc    Signup
// @route   GET /api/v1/auth/signup
// @access  Public

exports.signup = asyncHandler(async (req, res, next) => {
    // 1- Create user
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
  
    // 2- Generate token
    const token = jwt.sign( {userId:user._id}  , process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRE_TIME
    } )
  
    res.status(201).json({ data: user, token }) ;
  });


  // @desc    Login
// @route   GET /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  // 1) check if password and email in the body (validation)
  // 2) check if user exist & check if password is correct
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError('Incorrect email or password', 401));
  }

  // 3) generate token
  const token = createToken(user._id);
  

  // Delete password from response
  // delete user._doc.password;

  // 4) send response to client side
  res.status(200).json({ data: user, token });
});

// @desc   make sure the user is logged in

 exports.protect=  asyncHandler( async( req,res, next )=>{

  // 1) Check if token exist , if exist get
  let token;

  if( req.headers.authorization  ){
    token= req.headers.authorization.split(" ")[1];
   // console.log(token);
  }

  if(!token) {
    return next( new ApiError('You are not login, Please login to get access this route', 401 ))
  }

  // 2 Verify token (no change happens , expired token )
  const decoded = jwt.verify( token, process.env.JWT_SECRET_KEY );
  //console.log(decoded);  // decoded contient 2 choses: expiretion and _id de user
  
  //3 Check if user exists
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        'The user that belong to this token does no longer exist',
        401
      )
    );
  }
  // NOT access to route if user active= false
  if(!currentUser.active){
    return next(
      new ApiError(
        'The user is Desactivated',
        404
      )
    );
  }

  //4 Check if user change his password after token Created

  if(currentUser.passwordChangedAt ){
   // console.log( currentUser.passwordChangedAt, decoded.iat );
   // transformer Date of changed password in timestamp
   const passChangedTimestamp = parseInt( currentUser.passwordChangedAt.getTime() / 1000, 10 );
   // console.log(passChangedTimestamp , decoded.iat);

    // password Changet after token created (Error)
    if(passChangedTimestamp > decoded.iat ) {
      return next( 
         new ApiError( "User recently changed his password .please login again ..",401 ) 
        );
    }
  }

  req.user = currentUser;
  next();

} )

  // @desc    Authorization (User Permissions)
// ["admin", "manager"] par exemple
 exports.allowedTo = (...roles) =>
   asyncHandler( async(req, res, next)=> {
      if(!roles.includes(req.user.role)) {
        return next( new ApiError("You are not allowed to access this route", 403) );
      }
      next();
   })

     // @desc    Forgot password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
exports.forgotPassword= asyncHandler( async( req, res,next)=>{

  // 1 Get user by email
  const user= await User.findOne( {email: req.body.email} );
  if(!user){
    return next( new ApiError(`There is no user  with that email ${req.body.email}`, 404) );
  }

  //2 If user exist , Generate random 6 numbers and save it in db 
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode =crypto.createHash('sha256')
    .update(resetCode)
    .digest('hex');

    // console.log(resetCode);
    // console.log(hashedResetCode);

    //save hashed password reset code into DB
    user.passwordResetCode = hashedResetCode;
    // expiretion time for resete code  (10min)
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    user.passwordResetVerified = false;

   await user.save();

  //3 Send the reset code via email
  const message= ` Hi ${user.name}, \n we received a request to reset the password on your shopping Account. \n ${resetCode}\n Enter this code to complete the reset.\n Thanks for helping Us `
   
   try{

      await sendEmail( {
        email: user.email, 
        subject:'Your password reset code (valid for 10min)',
        message,
        } );

   } catch(err){
    user.passwordResetCode= undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next( new ApiError( "There is an error in sending email", 500 ) );
   }

    res.status(200).json({ status:"success",message:"Reset Code Sent to Email" });

} )

      // @desc  password Verify Reset Code 
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public

exports.verifyPassResetCode= asyncHandler( async( req, res, next)=>{

  //1 Get user based on reset code 
  
  const hashedResetCode =crypto.createHash('sha256')
  .update(req.body.resetCode)
  .digest('hex');

  const user= await User.findOne( {
    passwordResetCode:hashedResetCode,
    passwordResetExpires: { $gt: Date.now() }
  } );

  if(!user) {
    return next( new ApiError("Reset code invalid or expired") );
  }

  // 2 Reset Code valid 
  user.passwordResetVerified = true;

  await user.save();

  res.status(200).json({ status:"Success" });

} )


  // @desc   Reset Password
// @route   POST /api/v1/auth/resetPassword
// @access  Public

exports.resetPassword= asyncHandler( async( req, res ,next)=>{
    // 1 Get user based on email
  const user= await User.findOne( {email: req.body.email} );

  if(!user) {
    return next( new ApiError(` There is no user with email ${req.body.email} `, 404) );
  }
  // 2 check if reset code verified ? 
  if(!user.passwordResetVerified) {
    return next( new ApiError( "Reset Code not Verified", 400 )); 
  } 

  user.password = req.body.newPassword

  user.passwordResetCode= undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  //3 if everything is ok , generate Token

  const token =  createToken(user._id );

  res.status(200).json( { token } )

} )


// 

