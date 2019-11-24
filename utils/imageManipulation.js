// const multer = require('multer');

// class ImageManipulation {

//     constructor(req, res) {
//         this.req = req;
//         this.res = res;
//     }

//     // // This informs that storage option is buffer
//     // storage = multer.memoryStorage();

//         // This will check if uploaded file is image or not 
//         fileFilter(req, file, cb) {
//             if (file.mimetype.startsWith('image'))
//                 cb(null, true);
//             else
//                 cb(new AppError('Please upload a image', 400), false);
//         };

//     uploadSinglePhoto() {
//         // This informs that storage option is buffer
//         const storage = multer.memoryStorage();

//         // Stores file into specified storage with specified filename
//         const upload = multer(
//             {
//                 storage,
//                 fileFIlter : this.fileFilter
//             });
//         upload.single('photo');
//         console.log(this.req.file);
//         return this
//     }

//     async resizeUserPhoto() {
//         if (!this.req.file) return next();
//         this.req.file.filename = `users/user-${req.user.id}-${Date.now()}.jpeg`;
//         await sharp(this.req.file.buffer)
//             .resize(500, 500)
//             .toFormat('jpeg')
//             .jpeg({ quality: 90 })
//         // .toFile(`public/img/users/${req.file.filename}`);
//         return this;
//         // this.uploadImagetoS3Bucket(this.req.file);
//     }

//     uploadImagetoS3Bucket(file) {
//         // const file = req.file;
//         let s3Bucket = new AWS.S3({
//             accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//             secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//             region: process.env.AWS_REGION
//         });

//         var params = {
//             Bucket: process.env.AWS_BUCKET_NAME,
//             Key: file.filename,//`users/user-${req.user.id}-${Date.now()}.jpeg`,
//             Body: file.buffer,
//             ContentType: file.mimetype,
//             ACL: "public-read"
//         };

//         s3Bucket.upload(params, (err, data) => {
//             if (err) {
//                 console.log(err);
//                 return next(new AppError(err.message, 500));
//             }
//             // Setting URL of location where image is stored on s3 bucket  
//             file.filename = data.Location;
//         });

//     }
// }

// module.exports = ImageManipulation;