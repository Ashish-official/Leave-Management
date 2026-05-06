import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

/**
 * Register a new user and return auth information.
 */
router.post('/register', register);

/**
 * Authenticate a user and return a JWT token.
 */
router.post('/login', login);

export default router;
