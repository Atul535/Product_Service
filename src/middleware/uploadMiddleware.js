const multer = require('multer');
const path = require('path');

//configure how files are stored

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null, 'uploads/'); //store in the upload folder  
    },
    filename:(req,file,cb)=>{
        //give the file a unique name
        cb(null,Date.now()+path.extname(file.originalname));
    }
});

const upload =multer({storage:storage});

module.exports=upload;