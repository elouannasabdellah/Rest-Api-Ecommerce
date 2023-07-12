
const { check }  = require('express-validator');

const validatorMiddelware= require('../../middelwares/ValidatorMiddelware')

 exports.getBrandValidator= [

    check('id').isMongoId().withMessage('Invalid brand Id'),
    validatorMiddelware ,

 ];

 
 exports.createBrandValidator= [

    check("name").notEmpty().withMessage(' name of brand is required')
    .isLength({min:3}).withMessage("Too short category name")
    .isLength({max:32}).withMessage('Too long category name'),
    
    validatorMiddelware ,

 ];

 exports.updateBrandValidator= [
    check('id').isMongoId().withMessage('Invalid brand Id'),
    validatorMiddelware ,
 ];

 exports.deleteBrandValidator = [
    check('id').isMongoId().withMessage('Invalid brand Id'),
    validatorMiddelware ,
 ]

