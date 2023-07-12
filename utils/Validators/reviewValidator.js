
const { check }  = require('express-validator');

const validatorMiddelware= require('../../middelwares/ValidatorMiddelware');
const ReviewModel = require('../../models/reviewModel');

 exports.getReviewValidator= [

    check('id').isMongoId().withMessage('Invalid Review Id'),
    validatorMiddelware ,

 ];

 
 exports.createReviewValidator= [

    check("title").optional(),
    
    check('ratings').notEmpty().withMessage('ratings value Required')
    .isFloat({min:1 , max: 5}).withMessage('Ratings value must be between 1 to 5 '),

    check("user").isMongoId().withMessage('Invalid Review id user format'),

    check('product').isMongoId().withMessage('Invalid id product format')
    .custom((val, { req }) =>
    ReviewModel.findOne({ user: req.body.user, product: req.body.product }).then(
      (review) => {
        if (review) {
          return Promise.reject(
            new Error(`You already added review on this product`)
          );
        }
      }
    )
  ),
    validatorMiddelware ,

 ];

 exports.updateReviewValidator= [
    check('id').isMongoId().withMessage('Invalid Review Id')

    .custom( (val,{req})=>
      //check review ownership before update
      ReviewModel.findById(val).then((review)=>{
         if(!review){
            return Promise.reject( new Error(`There is no review with id ${val}`) );
         }
         if(review.user._id.toString() !== req.user._id.toString() ){
            return Promise.reject( new Error("You are not allowed to perform this action: not your review ") );
         }
      })
     ),

    
    validatorMiddelware ,
 ];

 exports.deleteReviewValidator = [
    check('id').isMongoId().withMessage('Invalid Review Id')

    .custom( (val,{req})=> {
      // because admin have action to delete review
      if(req.user.role === "user"){

           return ReviewModel.findById(val).then((review)=>{
               if(!review){
                  return Promise.reject( new Error(`There is no review with id ${val}`) );
               }
               if(review.user._id.toString() !== req.user._id.toString() ){
                  return Promise.reject( new Error("You are not allowed to perform this action: not your review ") );
               }
            } 
        
         )

      }
         return true;
    }
  
   ),

    validatorMiddelware ,
 ]

