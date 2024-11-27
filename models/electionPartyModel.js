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
    election_category_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ElectionCategory',
        required: true,
    }],
    candidate_id : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
});

module.exports = mongoose.model('ElectionParty',electionParty);