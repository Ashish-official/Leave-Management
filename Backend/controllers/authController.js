import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import LeaveBalance from '../models/LeaveBalance.js';
import createError from '../utils/createError.js';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  employeeId: user.employeeId,
  department: user.department,
  designation: user.designation,
  phone: user.phone,
  joiningDate: user.joiningDate,
  isActive: user.isActive,
});

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
      user: buildUserResponse(user),
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

    if (!user.isActive) {
      throw createError('Account is inactive', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw createError('Invalid credentials');
    }

    return res.json({
      token: generateToken(user),
      user: buildUserResponse(user),
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      throw createError('User not found', 404);
    }

    return res.json(buildUserResponse(user));
  } catch (error) {
    console.error(error);
    next(error);
  }
};
