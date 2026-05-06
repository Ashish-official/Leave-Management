import express from 'express';
import { getMe, register, login } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Register a new user and return auth information.
 */
router.post('/register', register);

/**
 * Authenticate a user and return a JWT token.
 */
router.post('/login', login);

router.get('/me', verifyToken, getMe);

export default router;
