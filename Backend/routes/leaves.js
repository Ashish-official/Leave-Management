import express from 'express';
import jwt from 'jsonwebtoken';
import LeaveRequest from '../models/LeaveRequest.js';

const router = express.Router();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

router.use(authMiddleware);

router.post('/', async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'All leave fields are required.' });
    }

    const leaveRequest = await LeaveRequest.create({
      userId: req.user.id,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    res.status(201).json(leaveRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create leave request.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const leaveRequests = await LeaveRequest.find(filter).sort({ createdAt: -1 });
    res.json(leaveRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load leave requests.' });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin privileges required.' });
    }

    const { status } = req.body;
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found.' });
    }

    leaveRequest.status = status;
    await leaveRequest.save();

    res.json(leaveRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update leave request status.' });
  }
});

export default router;
