// backend/routes/userRoutes.js

import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js'; // Ensure these are imported

const router = express.Router();

// Only System Administrator can access these routes
router.get('/', protect, authorizeRoles('System Administrator'), getAllUsers);
router.get('/:id', protect, authorizeRoles('System Administrator'), getUserById);
router.put('/:id', protect, authorizeRoles('System Administrator'), updateUser);
router.delete('/:id', protect, authorizeRoles('System Administrator'), deleteUser);


export default router;