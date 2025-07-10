// routes/authRoutes.js
import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js'; // Note .js extension and named imports

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router; // Use default export