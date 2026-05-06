import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import LeaveBalance from '../models/LeaveBalance.js';
import createError from '../utils/createError.js';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const selectPublicUser = '-password';

const getNormalizedUserPayload = (body) => ({
  name: body.name ? String(body.name).trim() : '',
  email: body.email ? String(body.email).trim().toLowerCase() : '',
  password: body.password ? String(body.password) : '',
  role: body.role ? String(body.role).toLowerCase() : 'employee',
  employeeId: body.employeeId ? String(body.employeeId).trim() : undefined,
  department: body.department ? String(body.department).trim() : '',
  designation: body.designation ? String(body.designation).trim() : '',
  phone: body.phone ? String(body.phone).trim() : '',
  joiningDate: body.joiningDate ? new Date(body.joiningDate) : undefined,
});

export const createUser = async (req, res, next) => {
  try {
    const payload = getNormalizedUserPayload(req.body);

    if (!payload.name) {
      throw createError('Name is required');
    }

    if (payload.name.length < 2) {
      throw createError('Name must be at least 2 characters');
    }

    if (!payload.email) {
      throw createError('Email is required');
    }

    if (!isValidEmail(payload.email)) {
      throw createError('Email must be a valid email address');
    }

    if (!payload.password) {
      throw createError('Password is required');
    }

    if (payload.password.length < 6) {
      throw createError('Password must be at least 6 characters');
    }

    if (!['employee', 'admin'].includes(payload.role)) {
      throw createError('Role must be employee or admin');
    }

    if (payload.joiningDate && Number.isNaN(payload.joiningDate.getTime())) {
      throw createError('Joining date must be a valid date');
    }

    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser) {
      throw createError('User already exists');
    }

    if (payload.employeeId) {
      const existingEmployeeId = await User.findOne({ employeeId: payload.employeeId });
      if (existingEmployeeId) {
        throw createError('Employee ID already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const user = await User.create({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
      employeeId: payload.employeeId,
      department: payload.department,
      designation: payload.designation,
      phone: payload.phone,
      joiningDate: payload.joiningDate,
    });

    if (user.role === 'employee') {
      await LeaveBalance.createDefaultForEmployee(user._id);
    }

    const createdUser = await User.findById(user._id).select(selectPublicUser);
    return res.status(201).json(createdUser);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { role, isActive } = req.query;
    const filters = {};

    if (role) {
      filters.role = role;
    }

    if (isActive === 'true') {
      filters.isActive = true;
    }

    if (isActive === 'false') {
      filters.isActive = false;
    }

    const users = await User.find(filters).select(selectPublicUser).sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(selectPublicUser);

    if (!user) {
      throw createError('User not found', 404);
    }

    return res.json(user);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw createError('User not found', 404);
    }

    if (req.body.name !== undefined) {
      user.name = String(req.body.name).trim();
    }

    if (req.body.role !== undefined) {
      user.role = String(req.body.role).toLowerCase();
    }

    if (req.body.employeeId !== undefined) {
      const employeeId = String(req.body.employeeId).trim();
      if (employeeId) {
        const existingEmployeeId = await User.findOne({
          _id: { $ne: user._id },
          employeeId,
        });

        if (existingEmployeeId) {
          throw createError('Employee ID already exists');
        }
      }
      user.employeeId = employeeId || undefined;
    }

    if (req.body.department !== undefined) {
      user.department = String(req.body.department).trim();
    }

    if (req.body.designation !== undefined) {
      user.designation = String(req.body.designation).trim();
    }

    if (req.body.phone !== undefined) {
      user.phone = String(req.body.phone).trim();
    }

    if (req.body.isActive !== undefined) {
      if (typeof req.body.isActive === 'boolean') {
        user.isActive = req.body.isActive;
      } else if (req.body.isActive === 'true') {
        user.isActive = true;
      } else if (req.body.isActive === 'false') {
        user.isActive = false;
      } else {
        throw createError('isActive must be true or false');
      }
    }

    if (!user.name) {
      throw createError('Name is required');
    }

    if (user.name.length < 2) {
      throw createError('Name must be at least 2 characters');
    }

    if (!['employee', 'admin'].includes(user.role)) {
      throw createError('Role must be employee or admin');
    }

    if (req.body.joiningDate) {
      const joiningDate = new Date(req.body.joiningDate);
      if (Number.isNaN(joiningDate.getTime())) {
        throw createError('Joining date must be a valid date');
      }
      user.joiningDate = joiningDate;
    }

    await user.save();

    if (user.role === 'employee') {
      await LeaveBalance.createDefaultForEmployee(user._id);
    }

    const updatedUser = await User.findById(user._id).select(selectPublicUser);
    return res.json(updatedUser);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw createError('User not found', 404);
    }

    user.isActive = false;
    await user.save();

    return res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
