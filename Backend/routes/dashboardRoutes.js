import express from 'express';
import { getAdminDashboard } from '../controllers/dashboardController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, isAdmin, getAdminDashboard);

export default router;
