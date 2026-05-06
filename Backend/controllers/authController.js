import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import LeaveBalance from '../models/LeaveBalance.js';

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );
};

/**
 * Register a new user and return a JWT token with user details.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const trimmedName = name ? String(name).trim() : '';
    const normalizedEmail = email ? String(email).trim().toLowerCase() : '';

    if (!name) {
      throw createError('Name is required');
    }

    if (trimmedName.length < 2) {
      throw createError('Name must be at least 2 characters');
    }

    if (!email) {
      throw createError('Email is required');
    }

    if (!isValidEmail(normalizedEmail)) {
      throw createError('Email must be a valid email address');
    }

    if (!password) {
      throw createError('Password is required');
    }

    if (String(password).length < 6) {
      throw createError('Password must be at least 6 characters');
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw createError('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
    });
    await LeaveBalance.createDefaultForEmployee(user._id);

    return res.status(201).json({
      token: generateToken(user),
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * Authenticate a user and return a JWT token with user details.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email ? String(email).trim().toLowerCase() : '';

    if (!email) {
      throw createError('Email is required');
    }

    if (!password) {
      throw createError('Password is required');
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw createError('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw createError('Invalid credentials');
    }

    return res.json({
      token: generateToken(user),
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
