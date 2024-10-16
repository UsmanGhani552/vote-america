const Joi = require('joi');

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
function resendOtp(data) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });

  const result = schema.validate(data, { abortEarly: false });

  return validateSchema(schema, data);
}


function login(data) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    fcm_token: Joi.string().required() // Adjust this based on your requirements
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

function personalDetail(data, userType) {
  const schema = Joi.object({
    zip_code: Joi.required(),
    dob: Joi.required(),
    security_number: Joi.required(),
    bio: Joi.any().when('type', { is: 'candidate', then: Joi.required(), otherwise: Joi.optional() }),
  });

  const result = schema.validate(data, { abortEarly: false });

  return validateSchema(schema, data, { userType });
}

function forgotPassword(data) {
  const schema = Joi.object({
    email: Joi.required(),
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

function changeStatus(data, userType) {
  const schema = Joi.object({
    personal_details_status: Joi.required(),
    government_photo_id_status: Joi.required(),
    // document_status: Joi.alternatives().conditional('type', { is: 'candidate', then: Joi.required() })
    document_status: Joi.any().when('type', { is: 'candidate', then: Joi.required(), otherwise: Joi.optional() }),
  });

  return validateSchema(schema, data, { userType });
}

function editProfile(data, userType) {
  const schema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    phone: Joi.string().required(),
    bio: Joi.any().when(Joi.ref('$userType'), { is: 'candidate', then: Joi.required(), otherwise: Joi.optional() }),

  });

  return validateSchema(schema, data, { userType });
}

function createCandidate(data) {
  const schema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(50).required(),
    confirm_password: Joi.any().valid(Joi.ref('password')).required().label('Confirm Password').options({ messages: { 'any.only': '{{#label}} and Password does not match' } }),
    zip_code: Joi.required(),
    dob: Joi.required(),
    security_number: Joi.required(),
  });

  return validateSchema(schema, data);
}


function validateSchema(schema, data, context) {
  const result = schema.validate(data, {
    abortEarly: false,
    context: context
  });
console.log(result);
  if (result.error) {
    const errors = result.error.details.map(detail => detail.message);
    console.log("Validation Error: ", result.error); // Log the error to see what’s happening
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
  changePassword,
  resendOtp,
  changeStatus,
  editProfile,
  createCandidate
};