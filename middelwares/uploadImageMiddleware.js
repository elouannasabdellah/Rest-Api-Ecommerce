
const multer  = require('multer');
const { v4: uuidv4 } = require('uuid');
const ApiError= require('../utils/apiError')

 // upload single image

exports.uploadSingleImage= (fildename,name)=> {

const multerStorage= multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, `uploads/${name}`)
      },

      filename: function(req, file, cb ){
        const ext= file.mimetype.split("/")[1];
        const filename= `${name}-${uuidv4()}-${Date.now()}.${ext}`;
        cb(null, filename);
        
         req.body.fildename= filename

         req.body.imageCover=filename;

      }
});

const multerFilter= function(req, file, cb ){
    //image/jpg
    if(file.mimetype.startsWith("image") ){
        cb(null, true )
    }else{
        cb( new ApiError("Only images allowed", 400), false );
    }
}

const upload= multer({ storage: multerStorage, fileFilter:multerFilter });

return upload.single(fildename);

}