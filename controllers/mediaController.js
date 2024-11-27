const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config(); // To load environment variables

const s3 = new S3Client({
    region: process.env.AWS_REGION || 'us-east-2',
    credentials: {
        accessKeyId: process.env.AWS_S3_IAM_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_IAM_SECRET_ACCESS_KEY
    }
});

const upload = (folderName = 'uploads') => multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        acl: 'public-read',
        key: function (req, file, cb) {
            const fileName = `${folderName}/${Date.now().toString()}-${file.originalname}`;
            cb(null, fileName);
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB file size limit
    },
});

module.exports = upload;