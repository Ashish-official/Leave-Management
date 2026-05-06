const allowedStatusCodes = [400, 401, 403, 404, 500];

const errorHandler = (error, req, res, next) => {
  const requestedStatus = error.statusCode || error.status || 500;
  const statusCode = allowedStatusCodes.includes(requestedStatus) ? requestedStatus : 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
  });
};

export default errorHandler;
