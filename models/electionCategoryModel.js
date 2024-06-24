const  mongoose  = require("mongoose");

const electionCategory = mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    description : {
        type: String,
        required: true
    },
    image : {
        type: String,
        required: true
    },
    election_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
});

module.exports = mongoose.model('ElectionCategory',electionCategory);