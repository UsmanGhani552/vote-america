const mongoose = require('mongoose');

const electionPartySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    election_category_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ElectionCategory',
        required: true
    }],
    candidates: [{ // Updated candidates field
        candidate_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        category_id: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ElectionCategory',
            required: true // Ensure every candidate is tied to at least one category
        }]
    }]
});


module.exports = mongoose.model('ElectionParty',electionPartySchema);