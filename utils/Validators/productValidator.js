
const { check }  = require('express-validator');

const validatorMiddelware= require('../../middelwares/ValidatorMiddelware');
const CategoryModel= require('../../models/categoryModel');
const SubcategoryModel= require('../../models/subCategoryModel');

 exports.createProductValidator= [

    check('title').isLength({min:3}).withMessage('must be a least 3 chars')
    .notEmpty().withMessage('product Required'),

    check('description').notEmpty().withMessage('product description is required')
    .isLength({max: 2000}).withMessage('Too long description'),

    check('quantity').notEmpty().withMessage('Product quantity is required')
    .isNumeric().withMessage('product quatity must be a number '),

    check('sold').optional()
    .isNumeric().withMessage('Product sold is must be a number'),

    check('price').notEmpty().withMessage("'product price is required")
    .toFloat()
    .isNumeric().withMessage('product price must be a number')
    .isLength({max: 32}).withMessage('To long price'),

    check('priceAfterDisCount').optional()
    .toFloat()
    .isNumeric().withMessage('product price After Discount')
    .custom( (value, {req} )=>{
        if(req.body.price <= value  ){
            throw new Error('priceAfterDiscount must be lower than price ');
        }
        return true;
    } ),

    check('colors').optional()
    .isArray().withMessage('available colors should be array of string'),

    check('imageCover').notEmpty().withMessage('product imageCover is required'),
    
    check('images').optional()
    .isArray().withMessage(' images should be array of string'),

    check('category').notEmpty().withMessage('Product must be a category')
    .isMongoId().withMessage('Invalid Id Format').custom((categoryId)=>CategoryModel.findById(categoryId).then((category)=>{
        if(!category){
            return Promise.reject(
                new Error(`No Catgory for this id : ${categoryId}`)
            );
        }
    })),

    check('subcategory').optional().isMongoId().withMessage('Invalid Id format')
        // verification que subcategories est dans la BD
    .custom((subcategoryIds)=>SubcategoryModel.find( {_id: { $exists:true , $in: subcategoryIds } } ).then((result)=>{
     //   console.log(result.length)
        if(result.length <1 || result.length !== subcategoryIds.length ){
            return Promise.reject(
                new Error(`No subCategories for this ids : ${subcategoryIds}`)
            );
        }
    })).custom((val , {req})=>SubcategoryModel.find({ category :req.body.category }).then((subcategories)=>{
            // Afficher  les subcategories qui est en la meme category lidkhilna flproduct
           // console.log(subcategories)
           const subCategoriesIdsInDB= [];
           subcategories.forEach(subCategory => {
                 subCategoriesIdsInDB.push(subCategory._id.toString())
           });

          // console.log(subCategoriesIdsInDB);

        //    const checker= val.every( v=> subCategoriesIdsInDB.includes(v) )
        //    console.log(checker);
        // checker return => true or false 
           if( !val.every( (v)=> subCategoriesIdsInDB.includes(v) ))
                return Promise.reject(
                    new Error(`subcategories Id not belong to category`)
                );
        }
       
    )),
    
    check('brand').optional().isMongoId().withMessage('Invalid Id format'),

    check('ratingsAverage').optional()
    .isNumeric().withMessage('ratingsAverage mut be a Number')
    .isLength({min:1}).withMessage(' Rating must be above or equal 1.0 ')
    .isLength({max:5}).withMessage('Rating must be below or equal 5.0'),

    check('ratingsQuantity').optional().isNumeric().withMessage('ratingsQuantity must be a Number'),

    validatorMiddelware,

 ];


 exports.getProductValidator = [

    check("id").isMongoId().withMessage('Invalid Id format'),
    validatorMiddelware,

 ];

 exports.updateProductValidator = [

    check("id").isMongoId().withMessage('Invalid Id format'),
    validatorMiddelware,

 ];

 exports.deleteProductValidator = [
    
    check("id").isMongoId().withMessage('Invalid Id format'),
    validatorMiddelware,

 ]