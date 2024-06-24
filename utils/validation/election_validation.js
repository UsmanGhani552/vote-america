const Joi = require('@hapi/joi');



function election(data) {
    const schema = Joi.object({
        name: Joi.string().required(),
    });

    const result = schema.validate(data, { abortEarly: false });

    return validateSchema(schema, data);
}
function electionCategory(data) {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        election_id: Joi.required(),
    });

    const result = schema.validate(data, { abortEarly: false });

    return validateSchema(schema, data);
}
function electionParty(data) {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
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
    election,
    electionCategory,
    electionParty
};