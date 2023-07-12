const asyncHandler = require('express-async-handler')
const User= require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


var slugify = require('slugify')
const ApiError= require('../utils/apiError')
const { uploadSingleImage} = require('../middelwares/uploadImageMiddleware');

//upload image
 exports.uploadUserImage= uploadSingleImage("profileImg","users");

// @desc    Create user
// @route   POST  /api/v1/users
// @access  Private/Admin

 exports.createUser= asyncHandler( async( req, res)=>{

    req.body.profileImg=req.body.fildename;
    
    const user = await User.create(req.body);
    res.status(201).json({ data: user });
 } )

 // @desc    Get specific user by id
// @route   GET /api/v1/users/:id
// @access  Private/Admin

 exports.getUser= asyncHandler( async(req,res, next)=>{

    const { id } = req.params;
    const user = await User.findById(id);

    if(!user) {
        return next(new ApiError(`No User for this id ${id}`, 404));
    }
    res.status(200).json({ data: user });

 } )

 // @desc    Get list of users
// @route   GET /api/v1/users
// @access  Private/Admin

 exports.getAllUsers= asyncHandler( async(req,res)=>{

    const page= req.query.page * 1 ||1;
    const limit= req.query.limit * 1 || 5;
    const skip= (page - 1) * limit
      const users= await User.find({}).skip(skip).limit(limit);
      res.status(200).json({ results:users.length ,page, data:users})

 } )

 // @desc    Update specific user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin

exports.updateUser= asyncHandler( async(req,res, next)=>{
    const {  id}=req.params

    req.body.profileImg=req.body.fildename;

    const category= await User.findOneAndUpdate( req.params.id,
    {  name: req.body.name,
        slug: req.body.slug,
        phone: req.body.phone,
        email: req.body.email,
        profileImg: req.body.profileImg,
        role: req.body.role,
    },    
    {new:true}
  )
    
    if(!category){
         return next( new ApiError(`No User for this id ${id}`, 404) );
    }
    res.status(200).json({data:category})
 })

 
// @desc    Delete specific user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin

exports.deleteUser= asyncHandler( async(req,res, next)=>{
    
    const { id }= req.params
    const user= await User.findOneAndDelete(id)

    if(!user){
        // res.status(404).json({msg: `No Category for this id ${id}`})
       return  next( new ApiError(`No user for this id ${id}`, 404) );
    }
    res.status(200).send()

 } )
   // admin
exports.changeUserPassword= asyncHandler( async (req,res)=>{
   const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        password: await bcrypt.hash(req.body.password, 12),
        passwordChangedAt: Date.now(),
      },
      {
        new: true,
      }
    );

    if (!user) {
      return next(new ApiError(`No User for this id ${req.params.id}`, 404));
    }
    res.status(200).json({ data: user });
 } )


 // @desc    Get Logged user data 
// @route   Get /api/v1/users/getMe
// @access  Private/protected

exports.getLoggedUser= asyncHandler( async(req,res,next)=>{

   // const user= User.findById(req.user._id);

   // if(!user) {
   //    return next( new ApiError( `No User for this id ${req.user._id} ` ) );
   // }

   // res.status(200).json({ data:user });
   req.params.id = req.user._id;
   next();

} )

 // @desc    Update Logged user Password
// @route   Get /api/v1/users/updateMyPassword
// @access  Private/protected

exports.updateLoggedUserPassword = asyncHandler( async(req,res,next)=>{
     // 1 update user password
   const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        password: await bcrypt.hash(req.body.password, 12),
        passwordChangedAt: Date.now(),
      },
      {
        new: true,
      }
    );   

    // 2 Generate token
      const token = jwt.sign( {userId:user._id}  , process.env.JWT_SECRET_KEY, {
         expiresIn: process.env.JWT_EXPIRE_TIME
     } );
     res.status(200).json({ data: user, token });

} )
 
 // @desc    Update Logged user 
// @route   Get /api/v1/users/updateMe
// @access  Private/protected

exports.updateLoggedUserData = asyncHandler( async(req,res ,next)=>{

   const updateUser= await User.findByIdAndUpdate( req.user._id, {
      name:req.body.name,
      email:req.body.email,
      phone: req.body.phone,

   }, {new : true} );

   res.status(200).json( {data: updateUser});

} )

 // @desc    Descative  Logged user 
// @route   DELETE /api/v1/users/deleteMe
// @access  Private/protected

exports.deleteLoggedUserData = asyncHandler( async( req,res , next)=> {
   await User.findByIdAndUpdate( req.user._id, {active: false} );

   res.status(204).json({ status:"success" });
} )


