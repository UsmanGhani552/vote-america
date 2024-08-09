import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import * as AWS from '@aws-sdk/client-s3';
// import express from 'express';
import multer from 'multer';
import  MediaModel  from '../models/mediaModel';
require('dotenv').config();


import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';
// import { Media, MediaDocument } from "./media.schema";
// import { Model } from "mongoose";
// import { ObjectId } from 'bson';

AWS_S3_BUCKET = 'nmo-bucket';
    const s3 = new AWS.S3({
        endpoint: 'https://s3.me-central-1.amazonaws.com',
        region: "me-central-1",
        credentials: {
            accessKeyId: '',
            secretAccessKey: '',
  },
});
// const client = new AWS.S3Client({
//     endpoint: 'https://s3.eu-west-2.amazonaws.com',
//     region: "eu-west-2",
//     credentials: {
//         accessKeyId: process.env.AWS_S3_IAM_ACCESS_KEY,
//         secretAccessKey: process.env.AWS_S3_IAM_SECRET_ACCESS_KEY,
//     },

// });

async function s3_upload(file, name, mimetype) {
    const params = {
        Bucket: AWS_S3_BUCKET,
        Key: String(name),
        Body: file,
        ACL: 'public-read',
        ContentType: mimetype,
        ContentDisposition: 'inline',
    };

    try {
        return await s3.upload(params).promise();
    } catch (e) {
        console.log(e);
    }
}
async function uploadFile(file) {
    const { originalname } = file;

    // Generate a unique timestamp (UUID) prefix for the media name
    const timestampPrefix = uuid.v4();

    // Create the modified name with timestamp prefix and file extension
    const modifiedName = `${timestampPrefix}_${originalname}`;

    // Logger.log(file.size, file.encoding)
    // Logger.log(modifiedName);


    const upload = await s3_upload(
        file.buffer,
        modifiedName,
        file.mimetype,
    );

    // const media = await this.mediaModel.create({ path: upload.location, name:originalname ,meta: { mimetype: file.mimetype, encoding: file.encoding, size: file.size } })
    const media = await MediaModel.create({ path: upload.Location, meta: { mimetype: file.mimetype, encoding: file.encoding, size: file.size } })


    return { status: true, message: "Success", responseData: media };

}

// routes.post('/upload', uploadS3.fields([{ name: 'video' }, { name: 'thumbnail' }, { name: 'audio' }, { name: 'image' }, { name: 'subtitle' }]), async (req: any, res, next) => {
//     try {

//         const isThumbnail = req.query.isThumbnail

//         let multipleMedia = [];


//         if (!Object.keys(req.files).length) return res.status(400).send({ msg: "Send media" })


//         if (Object.hasOwnProperty.bind(req.files)('image')) {
//             for (let i = 0; i < req.files.image.length; i++) {
//                 let metaData = {
//                     path: req.files.image[i].location,
//                     meta: {
//                         mimetype: req.files.image[i].mimetype,
//                         size: req.files.image[i].size,
//                         encoding: req.files.image[i].encoding
//                     }
//                 }
//                 multipleMedia.push(metaData);
//             }
//         }


//         if (Object.hasOwnProperty.bind(req.files)('video')) {
//             for (let i = 0; i < req.files.video.length; i++) {
//                 let metaData = {
//                     path: req.files.video[i].location,
//                     meta: {
//                         mimetype: req.files.video[i].mimetype,
//                         size: req.files.video[i].size,
//                         encoding: req.files.video[i].encoding
//                     },
//                     thumbnail: Boolean(Number(isThumbnail)) ? req.files.thumbnail[i].location : '',
//                     subtitle: Boolean(req.files.subtitle) ? req.files.subtitle[i].location : ''
//                 }
//                 multipleMedia.push(metaData);
//             }
//         }


//         if (Object.hasOwnProperty.bind(req.files)('audio')) {
//             for (let i = 0; i < req.files.audio.length; i++) {
//                 let metaData = {
//                     path: req.files.audio[i].location,
//                     meta: {
//                         mimetype: req.files.audio[i].mimetype,
//                         size: req.files.audio[i].size,
//                         encoding: req.files.audio[i].encoding
//                     },
//                 }
//                 multipleMedia.push(metaData);
//             }
//         }

//         if (Object.hasOwnProperty.bind(req.files)('subtitle')) {
//             for (let i = 0; i < req.files.subtitle.length; i++) {
//                 let metaData = {
//                     path: req.files.subtitle[i].location,
//                     meta: {
//                         mimetype: req.files.subtitle[i].mimetype,
//                         size: req.files.subtitle[i].size,
//                         encoding: req.files.subtitle[i].encoding
//                     },
//                 }
//                 multipleMedia.push(metaData);
//             }
//         }


//         let media = await MediaModel.InsertMultipleMedia(multipleMedia);


//         return res.status(200).send({ msg: "Success", data: media });


//     } catch (error) {
//         console.log(error);
//         return res.status(500).send({ msg: "Something went wrong" });
//     }
// })

// let maxSize = 2 * 100000 * 100000;

// const uploadS3 = multer({

//     limits: { fileSize: maxSize },
//     fileFilter: (req: any, file: any, cb: any) => {
//         if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == 'video/mp4' || file.mimetype == 'text/vtt' || file.mimetype == 'audio/mpeg' || file.mimetype == 'application/octet-stream') {
//             cb(null, true);
//             console.log('Check ====> file type allowed',file.mimetype)
//         } else {
//             console.log('Check ====> file type not allowed', file.mimetype)
//             cb(null, false);
//             return cb(new Error('Only .png, .jpg .mp4 .vtt .mp3 format allowed!'));
//         }
//     },

//     storage: multerS3({
//         acl: "public-read",
//         s3: client,
//         contentType: multerS3.AUTO_CONTENT_TYPE,
//         bucket: "fluospeak-bucket",
//         metadata: function (req, file, cb) {
//             cb(null, { fieldName: file.fieldname });
//         },
//         key: function (req, file, cb) {
//             let path = "";
//             let fileName =
//                 Math.random()
//                     .toString()
//                     .split(".")[1] +
//                 Date.now() +
//                 file.originalname.substr(file.originalname.length - 30 >= 0 ? file.originalname.length - 30 : 0);
//             fileName = fileName.replace(/\s/g, "").replace(/[^\w-.]+/g, "");
//             path = `${fileName}`;
//             cb(null, path)
//         },

//     })
// })

module.exports = uploadF