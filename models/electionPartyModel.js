const mongoose = require('mongoose');

const electionParty = mongoose.Schema({
    name: {
        type : String,
        required: true
    },
    icon: {
        type : String,
        required: true
    },
    description : {
        type: String,
        required: true
    },
    election_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
    candidate_id : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
});

module.exports = mongoose.model('ElectionParty',electionParty);