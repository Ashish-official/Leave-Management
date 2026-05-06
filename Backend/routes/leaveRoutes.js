import express from 'express';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import {
  applyLeave,
  getAllLeaves,
  getMyLeaveBalance,
  getMyLeaves,
  updateLeaveStatus,
} from '../controllers/leaveController.js';

const router = express.Router();

router.post('/apply', verifyToken, applyLeave);
router.get('/my-leaves', verifyToken, getMyLeaves);
router.get('/balance', verifyToken, getMyLeaveBalance);
router.get('/', verifyToken, isAdmin, getAllLeaves);
router.put('/:id/status', verifyToken, isAdmin, updateLeaveStatus);

export default router;
