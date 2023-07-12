
const express= require('express')

const {
    createReviewValidator, 
    getReviewValidator,
    updateReviewValidator,
    deleteReviewValidator,
     } = require('../utils/Validators/reviewValidator')


const { getReviews
    , getReview 
    , createReview,
    updatereview, deletereview, 
    setProductIdAndUserIdToBody,
     } = require('../services/raviewService')


const router= express.Router( {mergeParams: true} );

const authService = require('../services/authService');

router.route("/" ).get(getReviews).post( authService.protect,
    authService.allowedTo("user"),
    setProductIdAndUserIdToBody,
    createReviewValidator,
    createReview)

router.route('/:id').get( getReviewValidator, getReview )

 .put(  authService.protect,
    authService.allowedTo("user"), updateReviewValidator, updatereview).delete( authService.protect,
        authService.allowedTo("user", "admin"), deleteReviewValidator, deletereview )


module.exports= router