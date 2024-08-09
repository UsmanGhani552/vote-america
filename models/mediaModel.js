
const  mongoose  = require("mongoose");

const media = mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    path : {
        type: String,
        required: true
    },
    meta_data : {
        type: Object,
        required: true
    }
});

module.exports = mongoose.model('Media',media);