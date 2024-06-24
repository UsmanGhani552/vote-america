const mongoose = require('mongoose');

const tempUser = mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: Number, required: true },
    password: { type: String, required: true },
    type: { type: String, required: true },
    otp: { type: String, required: true },
    otp_expires_at: { type: String, required: true },
});

module.exports = mongoose.model('TempUser', tempUser);