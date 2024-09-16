const express = require('express');
const app = express();
const mongoose = require('./config')

const userRoutes = require('./routes/userRoute');
const electionRoutes = require('./routes/electionRoute');
const voteRoutes = require('./routes/voteRoute');
const webRoutes = require('./routes/webRoute');
require('dotenv').config()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Initialize S3 client
const s3 = new S3Client({
    region: process.env.AWS_REGION || 'us-east-2',
    credentials: {
        accessKeyId: process.env.AWS_S3_IAM_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_IAM_SECRET_ACCESS_KEY
    }
});
// Configure multer to use S3 storage
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        acl: 'public-read', // Adjust according to your needs
        key: function (req, file, cb) {
            // Store files in 'elections' folder
            const fileName = `elections/${Date.now().toString()}-${file.originalname}`;
            cb(null, fileName);
        }
    })
});

// Routes
app.get('/', (req, res) => {
    res.send('Helloaaaa World!');
});

app.post('/test-upload', upload.single('testfile'), (req, res) => {
    try{
        if (req.file) {
            res.send({
                status_code: 200,
                message: 'File uploaded successfully',
                file_url: req.file.location,
            });
        } else {
            res.status(400).send({
                status_code: 400,
                error: 'File upload failed',
            });
        }
    }catch(error){
        res.status(400).send({
            status_code: 400,
            error: error,
        });

    }
});

app.use('/api',userRoutes);
app.use('/api',electionRoutes);
app.use('/api',voteRoutes);

//web
app.use('/',webRoutes);

app.listen(process.env.PORT,function(){
    console.log(`Server is running on.....${process.env.PORT}`);
})