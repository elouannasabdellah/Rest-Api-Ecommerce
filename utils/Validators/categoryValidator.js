
const { check }  = require('express-validator');

const validatorMiddelware= require('../../middelwares/ValidatorMiddelware')

 exports.getCategoryValidator= [

    check('id').isMongoId().withMessage('Invalid Category Id'),
    validatorMiddelware ,

 ];

 
 exports.createCategoryValidator= [

    check("name").notEmpty().withMessage(' name of category is required')
    .isLength({min:3}).withMessage("Too short category name")
    .isLength({max:32}).withMessage('Too long category name'),
    
    validatorMiddelware ,

 ];

 exports.updateCategoryValidator= [
    check('id').isMongoId().withMessage('Invalid Category Id'),
    validatorMiddelware ,
 ];

 exports.deleteCategoryValidator = [
    check('id').isMongoId().withMessage('Invalid Category Id'),
    validatorMiddelware ,
 ]

