
const express= require("express");
const dotenv= require('dotenv')
const morgan= require('morgan')

const compression = require('compression');
const cors = require('cors'); 

dotenv.config({path: "config.env"})

const ApiError= require('./utils/apiError')
const globalError =require('./middelwares/errorMiddleware')

const dbConnection= require('./config/database')

const categoryRoute= require('./routes/categoryRoute')
const subcategoryRoute= require('./routes/subCategoryRoute')
const brandRoute= require('./routes/brandRoute')
const productRoute= require('./routes/productRoute')
const userRoute= require('./routes/userRoute')
const authRoute= require('./routes/authRoute')
const reviewRoute= require('./routes/reviewRoute')
const wishlistRoute= require('./routes/wishlistRoute')
const adressestRoute= require('./routes/adressesRoute')
const couponRoute= require('./routes/couponRoute')
const cartRoute= require('./routes/cartRoute')
const orderRoute= require('./routes/orderRoute')


//Connect width db 
    dbConnection();
const { webhookCheckout }= require("./services/orderService");
// express app 
const app= express();
app.use(cors())
app.options('*', cors()) // include before other routes

// compress all responses
app.use(compression())

// checkout webhook
app.post("/webhook-checkout", express.raw({type: 'application/json'}) ,webhookCheckout )

// Middlewares
app.use(express.json())
if(process.env.NODE_ENV==="developpement"){
    app.use(morgan('dev'));
    console.log(`mode: ${process.env.NODE_ENV}`);
}
// if(process.env.NODE_ENV==="production"){
//     app.use(morgan('prod'));
//     console.log(`mode: ${process.env.NODE_ENV}`);
// }



// Routes

app.use('/api/v1/categories', categoryRoute)
app.use('/api/v1/subcategories', subcategoryRoute)
app.use('/api/v1/brands', brandRoute )
app.use('/api/v1/products', productRoute )
app.use('/api/v1/users', userRoute )
app.use('/api/v1/auth', authRoute )
app.use('/api/v1/reviews', reviewRoute )
app.use('/api/v1/wishlist', wishlistRoute )
app.use('/api/v1/addresses', adressestRoute ) 
app.use('/api/v1/coupons',  couponRoute)
app.use('/api/v1/cart', cartRoute )
app.use('/api/v1/orders', orderRoute )



app.all("*", (req,res,next)=>{
    //Create error and send it to error handling middleware

    // const err= new Error(`Can't find this route ${req.originalUrl}`);
    // next(err.message);
    next( new ApiError(`Can't find this route ${req.originalUrl}`, 400) )
})

//Global error handling middleware  => pareceque en a deplacer cette error dans le dossier middlewares
app.use(globalError)


// app.use((err, req,res,next)=>{
//     err.statusCode= err.statusCode || 500;

//      res.status(err.statusCode).json({
//         error: err,
//         message:err.message,
//         // stack pour voir Ou se trouve l'error
//         //stack: err.stack
//      })
// })

const PORT= process.env.PORT || 7000;

 const server =  app.listen( PORT , ()=>{
    console.log(` App running on port ${PORT }` );    
} )

// Event Handel rejection error outside in express 

process.on("unhandledRejection", (err)=>{
    console.error(` unhandledRejection Database Error ${err} `);

    server.close(()=>{
        process.exit(1)
    })
   
})