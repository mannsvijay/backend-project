import multer from "multer";

// to configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

export const upload = multer({ 
    storage,
 })

 // we just created  this multer middleware to upload file temp on our server before uploading it to cloudinary

 //multer is a middleware for handling multipart/form-data, which is primarily used for uploading files. It makes it easy to handle file uploads in Express applications. In this code, we are configuring multer to store uploaded files in a temporary directory on the server before we upload them to cloudinary.