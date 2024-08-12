const mongoose = require('mongoose');

const MediaSchema = mongoose.Schema({
    fileName: { type: String, required: true },
    s3Key: { type: String, required: true },
    s3Url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Assuming you have a User model
});


module.exports = mongoose.model('Media', MediaSchema);