// routes/storeRoutes.js
import express from 'express';
import {
    createStore,
    getStores,
    getStoreById,
    updateStore,
    deleteStore
} from '../controllers/storeController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (anyone can view stores)
router.get('/', getStores);
router.get('/:id', getStoreById);

// Protected routes (require authentication and specific roles)
router.post('/', protect, authorizeRoles('Store Owner', 'System Administrator'), createStore);
router.put('/:id', protect, authorizeRoles('Store Owner', 'System Administrator'), updateStore);
router.delete('/:id', protect, authorizeRoles('Store Owner', 'System Administrator'), deleteStore);

export default router;