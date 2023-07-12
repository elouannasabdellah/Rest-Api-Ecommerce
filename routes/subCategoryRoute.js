
const express= require('express');

const { createSubCategory , getSubCategories, getSubCategory, updateSubCategory,deleteSubCategory , setCategoryIdToBody }= require('../services/subCategoryService');

const { createSubCategoryValidator, getSubCategoryValidator , updateSubCategoryValidator,deleteSubCategoryValidator }= require('../utils/Validators/subCategoryValidator')

const router= express.Router({ mergeParams: true } );


router.route("/").post( setCategoryIdToBody, createSubCategoryValidator,  createSubCategory).get(getSubCategories);

router.route("/:id").get( getSubCategoryValidator,  getSubCategory)
.delete( deleteSubCategoryValidator,  deleteSubCategory).put( updateSubCategoryValidator, updateSubCategory)

module.exports= router