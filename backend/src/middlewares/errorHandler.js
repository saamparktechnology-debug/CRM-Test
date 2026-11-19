const { errorResponse } = require('../utils/apiResponse');

/**
 * Global Express Error Handler
 * Normalizes Multer, MySQL, JWT, validation, and application errors into a single response format.
 */
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);

  if (res.headersSent) {
    return next(err);
  }

  // Multer file upload errors
  if (err && err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 400, 'File size exceeds the maximum allowed limit (10MB).');
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return errorResponse(res, 400, `Unexpected file field: ${err.field || 'unknown'}.`);
    }
    return errorResponse(res, 400, err.message || 'File upload failed.');
  }

  // MySQL / MariaDB constraint errors
  if (err && err.code) {
    if (err.code === 'ER_DUP_ENTRY') {
      return errorResponse(res, 409, 'A record with this unique value already exists.');
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
      return errorResponse(res, 400, 'Referenced record does not exist or is in use.');
    }
    if (err.code === 'ER_BAD_FIELD_ERROR' || err.code === 'ER_TRUNCATED_WRONG_VALUE') {
      return errorResponse(res, 400, err.sqlMessage || 'Invalid data provided.');
    }
  }

  // JWT errors
  if (err && (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')) {
    return errorResponse(res, 401, err.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid authentication token.');
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || null;

  return errorResponse(res, statusCode, message, errors);
};

module.exports = errorHandler;