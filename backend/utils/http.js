const mongoose = require('mongoose');
const fail = (status, message) => Object.assign(new Error(message), { status });
const id = value => typeof value === 'string' && mongoose.isObjectIdOrHexString(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const strings = value => Array.isArray(value) && value.length > 0 && value.every(text);
const handle = (res, error) => {
  const status = error.status || error.statusCode || (error.code === 11000 ? 409 : ['ValidationError', 'CastError'].includes(error.name) ? 400 : 500);
  if (status >= 500) console.error(error.name, error.message);
  return res.status(status).json({ message: status >= 500 ? 'Unable to complete request' : error.code === 11000 ? 'A matching record already exists' : error.message });
};
module.exports = { fail, id, text, strings, handle };
