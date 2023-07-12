
const { check, body } = require('express-validator');
const validatorMiddelware= require('../../middelwares/ValidatorMiddelware')
const User = require('../../models/userModel');
const bcrypt = require('bcryptjs');
const { default: slugify } = require('slugify');

exports.createUserValidator = [

    check('name')
      .notEmpty()
      .withMessage('User required')
      .isLength({ min: 3 })
      .withMessage('Too short User name'),
     
  
    check('email')
      .notEmpty()
      .withMessage('Email required')
      .isEmail()
      .withMessage('Invalid email address')
      .custom((val) =>
        User.findOne({ email: val }).then((user) => {
          if (user) {
            return Promise.reject(new Error('E-mail already in user'));
          }
        })
      ),

      check('password')
      .notEmpty()
      .withMessage('Password required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
       .custom(( password,{req} )=> {
          if(password !==req.body.passwordConfirm) {
            throw new Error("Password Confirmation incorrect");
          }
          return true;
       }) ,

      check('passwordConfirm')
    .notEmpty()
    .withMessage('Password confirmation required'),

      check('phone')
    .optional()
    .isMobilePhone(["ar-MA"])
    .withMessage("Invalid phone number only accepted Moroc a Phone numbers"),

      check('profileImg').optional(),
      check('role').optional(),

      validatorMiddelware
 ]

 exports.getUserValidator = [
    check('id').isMongoId().withMessage('Invalid User id format'),
    validatorMiddelware,
  ];

  exports.deleteUserValidator = [
    check('id').isMongoId().withMessage('Invalid User id format'),
    validatorMiddelware,
  ];

  exports.updateUserValidator = [
    check('id').isMongoId().withMessage('Invalid User id format'),
    body('name')
      .optional(),

    check('email')
      .notEmpty()
      .withMessage('Email required')
      .isEmail()
      .withMessage('Invalid email address')
      .custom((val) =>
        User.findOne({ email: val }).then((user) => {
          if (user) {
            return Promise.reject(new Error('E-mail already in user'));
          }
        })
      ),
    check('phone')
      .optional()
      .isMobilePhone(["ar-MA"])
      .withMessage('Invalid phone number only accepted moroco Phone numbers'),
  
    check('profileImg').optional(),
    check('role').optional(),
    validatorMiddelware,
  ];

  exports.changeUserPasswordValidator = [
    check('id').isMongoId().withMessage('Invalid User id format'),

    body('currentPassword')
      .notEmpty()
      .withMessage('You must enter your current password'),

    body('passwordConfirm')
      .notEmpty()
      .withMessage('You must enter the password confirm'),

    body('password')
      .notEmpty()
      .withMessage('You must enter new password')
      .custom(async (val, { req }) => {
        // 1) Verify current password
        const user = await User.findById(req.params.id);
        if (!user) {
          throw new Error('There is no user for this id');
        }
        const isCorrectPassword = await bcrypt.compare(
          req.body.currentPassword,
          user.password
        );
        if (!isCorrectPassword) {
          throw new Error('Incorrect current password');
        }
  
        // 2) Verify password confirm
        if (val !== req.body.passwordConfirm) {
          throw new Error('Password Confirmation incorrect');
        }
        return true;
      }),
    validatorMiddelware,
  ];


  exports.updateLoggedUserValidator = [
    body('name')
      .optional()
      .custom( (val, {req} )=>{
        req.body.slug= slugify(val);
      }) ,

    check('email')
      .notEmpty()
      .withMessage('Email required')
      .isEmail()
      .withMessage('Invalid email address')
      .custom((val) =>
        User.findOne({ email: val }).then((user) => {
          if (user) {
            return Promise.reject(new Error('E-mail already in user'));
          }
        })
      ),
    check('phone')
      .optional()
      .isMobilePhone(["ar-MA"])
      .withMessage('Invalid phone number only accepted moroco Phone numbers'),
  
 
    validatorMiddelware,
  ]; 