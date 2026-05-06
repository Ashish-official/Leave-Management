import express from 'express';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from '../controllers/userController.js';

const router = express.Router();

router.use(verifyToken, isAdmin);

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
