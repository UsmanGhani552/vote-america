const mongoose =   require('mongoose');

const vote = new mongoose.Schema({
    voter_id: {
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required: true
    },
    candidate_id: {
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required: true
    },
    election_party_id: {
        type:mongoose.Schema.ObjectId,
        ref:'ElectionParty',
        required: true
    },
    election_category_id: {
        type:mongoose.Schema.ObjectId,
        ref:'ElectionCategory',
        required: true
    }
})

module.exports = mongoose.model('Vote',vote);