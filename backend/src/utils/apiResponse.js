/**
 * Standardized global API response helpers
 * Ensures consistent { success, status, statusCode, message, data, errors } across all endpoints.
 */
const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).json({
    success: true,
    status: 'success',
    statusCode,
    message,
    data,
  });
};

const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  return res.status(statusCode).json({
    success: false,
    status: 'error',
    statusCode,
    message,
    data: null,
    ...(errors ? { errors } : {}),
  });
};

module.exports = {
  successResponse,
  errorResponse,
};