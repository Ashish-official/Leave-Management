import LeaveRequest from '../models/LeaveRequest.js';
import LeaveBalance from '../models/LeaveBalance.js';

const validLeaveTypes = ['sick', 'casual', 'annual'];

const getLeaveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
  return Math.floor(diffMs / msPerDay) + 1;
};

const getEmployeeId = (req) => req.user._id || req.user.id;

export const applyLeave = async (req, res) => {
  try {
    const employeeId = getEmployeeId(req);
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'leaveType, startDate, endDate and reason are required.' });
    }

    const normalizedType = String(leaveType).toLowerCase();
    if (!validLeaveTypes.includes(normalizedType)) {
      return res.status(400).json({ message: 'leaveType must be one of sick, casual, or annual.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: 'startDate and endDate must be valid dates.' });
    }

    if (start > end) {
      return res.status(400).json({ message: 'startDate must be before or equal to endDate.' });
    }

    const daysRequested = getLeaveDays(start, end);
    if (daysRequested <= 0) {
      return res.status(400).json({ message: 'The requested leave duration must be at least one day.' });
    }

    const balance = await LeaveBalance.createDefaultForEmployee(employeeId);

    const availableDays = balance[normalizedType];
    if (availableDays === undefined) {
      return res.status(500).json({ message: 'Leave balance type not configured.' });
    }

    if (availableDays < daysRequested) {
      return res.status(400).json({
        message: `Insufficient ${normalizedType} leave balance. You have ${availableDays} day(s) available.`,
      });
    }

    const leaveRequest = await LeaveRequest.create({
      userId: employeeId,
      leaveType: normalizedType,
      startDate: start,
      endDate: end,
      reason,
      status: 'PENDING',
    });

    return res.status(201).json(leaveRequest);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to apply for leave.' });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const employeeId = getEmployeeId(req);
    const leaves = await LeaveRequest.find({ userId: employeeId }).sort({ createdAt: -1 });
    return res.json(leaves);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to load your leave requests.' });
  }
};

export const getMyLeaveBalance = async (req, res) => {
  try {
    const employeeId = getEmployeeId(req);
    const balance = await LeaveBalance.createDefaultForEmployee(employeeId);
    return res.json(balance);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to load leave balance.' });
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    return res.json(leaves);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to load leave requests.' });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Status must be APPROVED or REJECTED.' });
    }

    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found.' });
    }

    if (leaveRequest.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending leave requests can be updated.' });
    }

    if (status === 'APPROVED') {
      const daysRequested = getLeaveDays(leaveRequest.startDate, leaveRequest.endDate);
      const balance = await LeaveBalance.createDefaultForEmployee(leaveRequest.userId);
      const availableDays = balance[leaveRequest.leaveType];

      if (availableDays < daysRequested) {
        return res.status(400).json({
          message: `Insufficient ${leaveRequest.leaveType} leave balance. Employee has ${availableDays} day(s) available.`,
        });
      }

      balance[leaveRequest.leaveType] = availableDays - daysRequested;
      await balance.save();
    }

    leaveRequest.status = status;
    await leaveRequest.save();

    return res.json(leaveRequest);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update leave request status.' });
  }
};
