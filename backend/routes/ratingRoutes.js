// backend/routes/ratingRoutes.js
import express from 'express';
import {
    createRating,
    getAllRatings,
    getRatingsByStoreId,
    getRatingById,
    updateRating,
    deleteRating,
} from '../controllers/ratingController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes for viewing ratings
router.get('/', getAllRatings); // Get all ratings (maybe for admin or public listing)
router.get('/:id', getRatingById); // Get a single rating by ID
router.get('/store/:storeId', getRatingsByStoreId); // Get all ratings for a specific store

// Protected routes for creating, updating, deleting ratings
// Only logged-in users ('Normal User' or 'Store Owner' or 'System Administrator') can create ratings
router.post('/', protect, createRating);

// Only the owner of the rating OR a System Administrator can update/delete
router.put('/:id', protect, updateRating);
router.delete('/:id', protect, deleteRating); // Authorization logic is inside controller

export default router;