import LeaveRequest from '../models/LeaveRequest.js';
import LeaveBalance from '../models/LeaveBalance.js';

const validLeaveTypes = ['sick', 'casual', 'annual'];

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getLeaveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
  return Math.floor(diffMs / msPerDay) + 1;
};

const getEmployeeId = (req) => req.user._id || req.user.id;

export const applyLeave = async (req, res, next) => {
  try {
    const employeeId = getEmployeeId(req);
    const { leaveType, startDate, endDate, reason } = req.body;
    const trimmedReason = reason ? String(reason).trim() : '';

    if (!leaveType) {
      throw createError('Leave type is required');
    }

    const normalizedType = String(leaveType).toLowerCase();
    if (!validLeaveTypes.includes(normalizedType)) {
      throw createError('Leave type must be one of: sick, casual, annual');
    }

    if (!startDate) {
      throw createError('Start date is required');
    }

    if (!endDate) {
      throw createError('End date is required');
    }

    if (!trimmedReason) {
      throw createError('Reason is required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw createError('Start date and end date must be valid dates');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDay = new Date(start);
    startDay.setHours(0, 0, 0, 0);

    if (startDay < today) {
      throw createError('Start date cannot be in the past');
    }

    if (start > end) {
      throw createError('End date must be greater than or equal to start date');
    }

    const daysRequested = getLeaveDays(start, end);
    if (daysRequested <= 0) {
      throw createError('The requested leave duration must be at least one day');
    }

    const balance = await LeaveBalance.createDefaultForEmployee(employeeId);

    const availableDays = balance[normalizedType];
    if (availableDays === undefined) {
      throw createError('Leave balance type not configured', 500);
    }

    if (availableDays < daysRequested) {
      throw createError(`Insufficient leave balance for ${normalizedType} leave`);
    }

    const leaveRequest = await LeaveRequest.create({
      userId: employeeId,
      leaveType: normalizedType,
      startDate: start,
      endDate: end,
      reason: trimmedReason,
      status: 'PENDING',
    });

    return res.status(201).json(leaveRequest);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getMyLeaves = async (req, res, next) => {
  try {
    const employeeId = getEmployeeId(req);
    const leaves = await LeaveRequest.find({ userId: employeeId }).sort({ createdAt: -1 });
    return res.json(leaves);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getMyLeaveBalance = async (req, res, next) => {
  try {
    const employeeId = getEmployeeId(req);
    const balance = await LeaveBalance.createDefaultForEmployee(employeeId);
    return res.json(balance);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await LeaveRequest.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    return res.json(leaves);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw createError('Status must be APPROVED or REJECTED');
    }

    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      throw createError('Leave request not found', 404);
    }

    if (leaveRequest.status !== 'PENDING') {
      throw createError('Only pending leave requests can be updated');
    }

    if (status === 'APPROVED') {
      const daysRequested = getLeaveDays(leaveRequest.startDate, leaveRequest.endDate);
      const balance = await LeaveBalance.createDefaultForEmployee(leaveRequest.userId);
      const availableDays = balance[leaveRequest.leaveType];

      if (availableDays < daysRequested) {
        throw createError(`Insufficient leave balance for ${leaveRequest.leaveType} leave`);
      }

      balance[leaveRequest.leaveType] = availableDays - daysRequested;
      await balance.save();
    }

    leaveRequest.status = status;
    await leaveRequest.save();

    return res.json(leaveRequest);
  } catch (error) {
    console.error(error);
    next(error);
  }
};
