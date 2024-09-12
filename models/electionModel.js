const  mongoose  = require("mongoose");

const election = mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    image : {
        type: String,
        required: true
    },
    icon : {
        type: String,
        required: true
    },
    status : {
        type: Number,
        default: 1
    }
});

module.exports = mongoose.model('Election',election);