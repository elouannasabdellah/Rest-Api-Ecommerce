
const express= require('express')

const {  createProductValidator,
     getProductValidator, 
     updateProductValidator, 
     deleteProductValidator } = require('../utils/Validators/productValidator')


const { getProducts,
     getProduct, 
     createProduct, 
     updateProduct, 
     deleteProduct,
     uploadProductImage } = require('../services/productService')


const router= express.Router();
// Nested Route
const reviewRoute= require('./reviewRoute');
     //  GET  /api/v1/products/productId/reviews
     //  POST  /api/v1/products/productId/reviews
 router.use("/:productId/reviews", reviewRoute)

router.route("/" ).get(getProducts)
        .post( uploadProductImage,
             createProductValidator,
             createProduct)

router.route('/:id').get( getProductValidator , getProduct )

 .put(uploadProductImage, updateProductValidator,  updateProduct).delete( deleteProductValidator,  deleteProduct)


module.exports= router