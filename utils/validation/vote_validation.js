const Joi = require('joi');

function storeVote(data) {
    const schema = Joi.object({
        voter_id: Joi.required(),
        candidate_id: Joi.required(),
        election_party_id: Joi.required(),
        election_category_id: Joi.required(),
    });

    const result = schema.validate(data, { abortEarly: false });

    return validateSchema(schema, data);
}

function validateSchema(schema, data) {
    const result = schema.validate(data, { abortEarly: false });

    if (result.error) {
        const errors = result.error.details.map(detail => detail.message);
        return { errored: true, errors: errors, value: result.value };
    } else {
        return { errored: false, errors: null, value: result.value };
    }
}

module.exports = {
    storeVote,
};