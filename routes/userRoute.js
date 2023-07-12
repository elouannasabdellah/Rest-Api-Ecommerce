

const express= require('express');

const authService = require('../services/authService');

 const { createUserValidator ,
    getUserValidator, 
    deleteUserValidator, 
    updateUserValidator , 
    changeUserPasswordValidator , updateLoggedUserValidator} = require('../utils/Validators/userValidator');


const {createUser
    ,getUser,
    getAllUsers 
    , updateUser
    , deleteUser, uploadUserImage,
    changeUserPassword ,
    getLoggedUser ,
    updateLoggedUserPassword, 
    updateLoggedUserData, deleteLoggedUserData } = require('../services/userService')




const router= express.Router();

router.get("/getMe", authService.protect, getLoggedUser, getUser); 
router.put("/updateMyPassword", authService.protect, updateLoggedUserPassword );
router.put("/updateMe", authService.protect, updateLoggedUserValidator, updateLoggedUserData );
router.delete("/deleteMe", authService.protect, deleteLoggedUserData );



    // Admin
  router.route('/changePassword/:id')
    .put( authService.protect , authService.allowedTo('admin',"manager"),
     changeUserPasswordValidator, changeUserPassword);

router.route("/" )
    .get( authService.protect , authService.allowedTo('admin',"manager") ,getAllUsers)
    .post( authService.protect , authService.allowedTo('admin',"manager"),uploadUserImage, createUserValidator, createUser)

router.route('/:id')
        .get( authService.protect,
            authService.allowedTo('admin',"manager"),
            getUserValidator, getUser)
        .put( authService.protect, 
            authService.allowedTo('admin',"manager"),
            uploadUserImage, 
            updateUserValidator,
            updateUser
        )
        .delete(  authService.protect, authService.allowedTo('admin',"manager"),
        deleteUserValidator, deleteUser)


module.exports= router