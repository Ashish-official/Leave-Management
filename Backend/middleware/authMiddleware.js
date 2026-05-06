import jwt from 'jsonwebtoken';

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Verify JWT token from the Authorization header and attach decoded payload to req.user.
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError('Unauthorized', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    next(createError('Unauthorized', 401));
  }
};
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(createError('Forbidden', 403));
  }

  next();
};
