const Joi = require('@hapi/joi');

function register(data) {
  const schema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    phone: Joi.string().required(),
    type: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(50).required(),
    confirm_password: Joi.any().valid(Joi.ref('password')).required().label('Confirm Password').options({ messages: { 'any.only': '{{#label}} and Password does not match' } }),
  });

  const result = schema.validate(data, { abortEarly: false });

  return validateSchema(schema, data);
}

function login(data) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.required(),
  });

  const result = schema.validate(data, { abortEarly: false });

  return validateSchema(schema, data);
}

function verifyOtp(data) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.required(),
  });

  const result = schema.validate(data, { abortEarly: false });

  return validateSchema(schema, data);
}

function personalDetail(data) {
  const schema = Joi.object({
    zip_code: Joi.required(),
    dob: Joi.required(),
    security_number: Joi.required(),
  });

  const result = schema.validate(data, { abortEarly: false });

  return validateSchema(schema, data);
}

function forgotPassword(data) {
  const schema = Joi.object({
    phone: Joi.required(),
  });

  const result = schema.validate(data, { abortEarly: false });

  return validateSchema(schema, data);
}

function resetPassword(data) {
  const schema = Joi.object({
    token: Joi.required(),
    password: Joi.string().min(8).max(50).required(),
    confirm_password: Joi.any().valid(Joi.ref('password')).required().label('Confirm Password').options({ messages: { 'any.only': '{{#label}} and Password does not match' } }),
  });

  const result = schema.validate(data, { abortEarly: false });

  return validateSchema(schema, data);
}

function changePassword(data) {
  const schema = Joi.object({
    old_password: Joi.string().required(),
    password: Joi.string().min(8).max(50).required(),
    confirm_password: Joi.any().valid(Joi.ref('password')).required().label('Confirm Password').options({ messages: { 'any.only': '{{#label}} and Password does not match' } }),
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
  register,
  login,
  verifyOtp,
  personalDetail,
  forgotPassword,
  resetPassword,
  changePassword
};