
const express= require('express');


const {  getCategoryValidator, createCategoryValidator, updateCategoryValidator, deleteCategoryValidator } = require('../utils/Validators/categoryValidator')


const { getCategories, createCategory, getCategory, updateCategory, deleteCategory, uploadCategoryImage } = require('../services/categoryService')



const subcategoryRoute= require('./subCategoryRoute');

const router= express.Router();

const authService = require('../services/authService');


// router.get("/",getCategories)
// router.post('/', createCategory)
// nesed Route 

router.use("/:categoryId/subcategories" , subcategoryRoute )

router.route("/" )
.get(  getCategories)
.post(
    authService.protect 
    , authService.allowedTo('admin',"manager")
    , uploadCategoryImage,
     createCategoryValidator, 
     createCategory)

router.route('/:id')
    .get( getCategoryValidator , getCategory )
    .put( authService.protect , authService.allowedTo('admin',"manager"),
        uploadCategoryImage, 
        updateCategoryValidator,
        updateCategory 
    )
    .delete( authService.protect 
        , authService.allowedTo('admin'),
         deleteCategoryValidator,  deleteCategory)


module.exports= router