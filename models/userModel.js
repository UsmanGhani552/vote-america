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
        type : Number,
        required : true,
    },
    password: {
        type : String,
        required : true,
    },
    zip_code: {
        type : String,
        required : true,
    },
    dob: {
        type : String,
        required : true,
    },
    security_number: {
        type : String,
        required : true,
    },
    front_side: {
        type : String,
        required : true,
    },
    back_side: {
        type : String,
        required : true,
    },
    reset_token: {
        type : String,
        // required : true,
        // null:true
    },
    party_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ElectionParty'
    }
});

module.exports = mongoose.model('User',user);

