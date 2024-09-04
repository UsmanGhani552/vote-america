const { type } = require('@hapi/joi/lib/extend');
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
        required : true,
    },
    type: {
        type : String,
        enum:['user','candidate'],
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
        enum : ['Approved','Pending','Reject'],
        default: 'Pending'
    },
    government_photo_id_status: {
        type:String,
        enum : ['Approved','Pending','Reject'],
        default: 'Pending'
    },
    document_status: {
        type:String,
        enum : ['Approved','Pending','Reject'],
        default: 'Pending'
    },
});

module.exports = mongoose.model('User',user);

