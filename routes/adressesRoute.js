

const express= require('express')


const { addAdress, removeAddress,
    getLoggedAddresses  } = require('../services/adressesService')


const router= express.Router();

const authService = require('../services/authService');

router.use( authService.protect ,authService.allowedTo("user") )

router.route("/" ).post(  addAdress )
     .get( getLoggedAddresses )

router.route('/:addressId').delete( removeAddress )
   



module.exports= router