
const { check }  = require('express-validator');

const validatorMiddelware= require('../../middelwares/ValidatorMiddelware')

 exports.getSubCategoryValidator= [

    check('id').isMongoId().withMessage('Invalid Subcategory Id'),
    validatorMiddelware ,

 ];

 
 exports.createSubCategoryValidator= [

    check("name").notEmpty().withMessage(' name of subcategory is required')
    .isLength({min:2}).withMessage("Too short subcategory name")
    .isLength({max:32}).withMessage('Too long subcategory name'),

    check("category")
    .notEmpty().withMessage('Subcategory must be belong to category')
    .isMongoId().withMessage('Invalid Category id format'),
    
    validatorMiddelware ,

 ];

 exports.updateSubCategoryValidator= [
    check('id').isMongoId().withMessage('Invalid Subcategory Id'),
    validatorMiddelware ,
 ];

 exports.deleteSubCategoryValidator = [
    check('id').isMongoId().withMessage('Invalid Subcategory Id'),
    validatorMiddelware ,
 ]

