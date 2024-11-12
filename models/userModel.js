const mongoose = require('mongoose');

const user = mongoose.Schema({
    first_name: {
        type : String,
        required : true,
    },
    last_name: {
        type : String,
        required : true,
    },
    email: {
        type : String,
        required : true,
    },
    phone: {
        type : String,
    },
    social_id: {
        type : String,
    },
    provider: {
        type : String,
        enum: ['facebook','google','apple'],
    },
    image: {
        type : String,
    },
    type: {
        type : String,
        enum:['user','candidate','admin'],
        required : true,
    },
    password: {
        type : String,
        required : true,
    },
    zip_code: {
        type : String,
    },
    dob: {
        type : String,
    },
    security_number: {
        type : String,
    },
    bio: {
        type : String,
    },
    front_side: {
        type : String,
    },
    additional_documents: {
        type : [String],
    },
    back_side: {
        type : String,
    },
    reset_token: {
        type : String,
        // required : true,
        // null:true
    },
    party_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ElectionParty'
    },
    fcm_token: {
        type:String
    },
    personal_details_status: {
        type:String,
        enum : ['Approved','Pending','Rejected'],
        default: 'Pending'
    },
    government_photo_id_status: {
        type:String,
        enum : ['Approved','Pending','Rejected'],
        default: 'Pending'
    },
    document_status: {
        type:String,
        enum : ['Approved','Pending','Rejected'],
        default: 'Pending'
    },
    candidate_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        type:String,
    },
});

module.exports = mongoose.model('User',user);

