const Joi = require("@hapi/joi");

function login(data) {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });
  
    const result = schema.validate(data, { abortEarly: false });
  
    return validateSchema(schema, data);
  }


  function validateSchema(schema, data, context) {
    const result = schema.validate(data, { 
      abortEarly: false,
      context: context
     });
  
    if (result.error) {
      const errors = result.error.details.map(detail => detail.message);
      return { errored: true, errors: errors, value: result.value };
    } else {
      return { errored: false, errors: null, value: result.value };
    }
  }
  
  module.exports = {
    login,
  };