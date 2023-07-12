
const express= require('express')

const {getBrandValidator,createBrandValidator, updateBrandValidator , deleteBrandValidator } = require('../utils/Validators/brandValidator')


const { getBrands, getBrand , createBrand, updateBrand, deleteBrand, uploadBrandImage } = require('../services/brandService')


const router= express.Router();



router.route("/" ).get(getBrands).post(uploadBrandImage, createBrandValidator, createBrand)

router.route('/:id').get( getBrandValidator , getBrand )

 .put( uploadBrandImage, updateBrandValidator,  updateBrand).delete( deleteBrandValidator,  deleteBrand)


module.exports= router