// controllers/storeController.js
import Store from '../models/Store.js';
import User from '../models/User.js'; // Needed for include in get methods
import { logSuccess, logError } from '../utils/logger.js';
import { Op } from 'sequelize'; // For advanced queries if needed

// Helper function to check if user is admin or owner of the store
const isUserAdminOrStoreOwner = (req, store) => {
    return req.user.role === 'System Administrator' || (req.user.role === 'Store Owner' && store.userId === req.user.id);
};

// @desc    Create a new store
// @route   POST /api/stores
// @access  Private (Store Owner, System Administrator)
export const createStore = async (req, res) => {
    const { name, email, address } = req.body;
    const userId = req.user.id; // Get owner ID from authenticated user

    try {
        // Only Store Owners and System Administrators can create stores
        if (req.user.role !== 'Store Owner' && req.user.role !== 'System Administrator') {
            logError('Store creation failed: Insufficient permissions', null, { userId, role: req.user.role });
            return res.status(403).json({ success: false, message: 'Not authorized to create a store' });
        }

        // If the user is a Store Owner, they can only create a store for themselves
        // System Administrator can create for any user, but for simplicity here,
        // we'll assume they also create for themselves or the payload specifies userId.
        // For now, userId is always taken from req.user.id
        if (req.user.role === 'Store Owner' && userId !== req.user.id) {
             logError('Store creation failed: Store Owner trying to create for another user', null, { userId, requestedUserId: req.user.id });
             return res.status(403).json({ success: false, message: 'Store Owners can only create stores for themselves.' });
        }

        // Check if a store with this name already exists
        let existingStore = await Store.findOne({ where: { name } });
        if (existingStore) {
            logError('Store creation failed: Store name already exists', null, { name });
            return res.status(400).json({ success: false, message: 'Store with this name already exists.' });
        }

        const store = await Store.create({
            name,
            email,
            address,
            userId: userId, // Assign the authenticated user as the owner
        });

        logSuccess('Store created successfully', { storeId: store.id, storeName: store.name, ownerId: store.userId });
        res.status(201).json({
            success: true,
            message: 'Store created successfully',
            store: store,
        });

    } catch (error) {
        logError('Server error during store creation', error, { userId: req.user.id, name });
        res.status(500).json({ success: false, message: 'Server error during store creation' });
    }
};

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public (All users can view)
export const getStores = async (req, res) => {
    try {
        let stores;
        if (req.user && req.user.role === 'Store Owner') {
            // Store owners only see their own stores
            stores = await Store.findAll({
                where: { userId: req.user.id },
                include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }]
            });
            logInfo('Store Owner fetched their stores', { userId: req.user.id });
        } else {
            // All other users (Normal User, System Administrator, or unauthenticated) see all stores
            stores = await Store.findAll({
                include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }]
            });
            logInfo('All stores fetched', { userId: req.user ? req.user.id : 'unauthenticated' });
        }

        res.status(200).json({
            success: true,
            stores: stores,
        });

    } catch (error) {
        logError('Server error fetching stores', error, { userId: req.user ? req.user.id : 'unauthenticated' });
        res.status(500).json({ success: false, message: 'Server error fetching stores' });
    }
};

// @desc    Get store by ID
// @route   GET /api/stores/:id
// @access  Public (All users can view)
export const getStoreById = async (req, res) => {
    try {
        const store = await Store.findByPk(req.params.id, {
            include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }]
        });

        if (!store) {
            logError('Store not found', null, { storeId: req.params.id });
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        // Store Owners can only view their own store if they explicitly request it by ID
        if (req.user && req.user.role === 'Store Owner' && store.userId !== req.user.id) {
            logError('Store Owner attempted to view another user\'s store', null, { userId: req.user.id, storeId: req.params.id });
            return res.status(403).json({ success: false, message: 'Not authorized to view this store' });
        }

        logSuccess('Store fetched by ID', { storeId: store.id });
        res.status(200).json({
            success: true,
            store: store,
        });

    } catch (error) {
        logError('Server error fetching store by ID', error, { storeId: req.params.id, userId: req.user ? req.user.id : 'unauthenticated' });
        res.status(500).json({ success: false, message: 'Server error fetching store' });
    }
};

// @desc    Update a store
// @route   PUT /api/stores/:id
// @access  Private (Store Owner, System Administrator)
export const updateStore = async (req, res) => {
    const { name, email, address } = req.body;
    const { id } = req.params;

    try {
        let store = await Store.findByPk(id);

        if (!store) {
            logError('Store update failed: Store not found', null, { storeId: id });
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        // Authorization: Only admin or the store owner can update
        if (!isUserAdminOrStoreOwner(req, store)) {
            logError('Store update failed: Insufficient permissions or not owner', null, { userId: req.user.id, role: req.user.role, storeId: id });
            return res.status(403).json({ success: false, message: 'Not authorized to update this store' });
        }

        // Check if new name conflicts with existing store (excluding current store)
        if (name && name !== store.name) {
            const nameConflict = await Store.findOne({ where: { name, id: { [Op.ne]: id } } });
            if (nameConflict) {
                logError('Store update failed: New store name already exists', null, { storeId: id, newName: name });
                return res.status(400).json({ success: false, message: 'Another store with this name already exists.' });
            }
        }

        store.name = name || store.name;
        store.email = email || store.email;
        store.address = address || store.address;

        await store.save();

        logSuccess('Store updated successfully', { storeId: store.id, updatedFields: { name, email, address } });
        res.status(200).json({
            success: true,
            message: 'Store updated successfully',
            store: store,
        });

    } catch (error) {
        logError('Server error during store update', error, { storeId: req.params.id, userId: req.user.id, payload: req.body });
        res.status(500).json({ success: false, message: 'Server error during store update' });
    }
};

// @desc    Delete a store
// @route   DELETE /api/stores/:id
// @access  Private (Store Owner, System Administrator)
export const deleteStore = async (req, res) => {
    const { id } = req.params;

    try {
        const store = await Store.findByPk(id);

        if (!store) {
            logError('Store deletion failed: Store not found', null, { storeId: id });
            return res.status(404).json({ success: false, message: 'Store not found' });
        }

        // Authorization: Only admin or the store owner can delete
        if (!isUserAdminOrStoreOwner(req, store)) {
            logError('Store deletion failed: Insufficient permissions or not owner', null, { userId: req.user.id, role: req.user.role, storeId: id });
            return res.status(403).json({ success: false, message: 'Not authorized to delete this store' });
        }

        await store.destroy();

        logSuccess('Store deleted successfully', { storeId: id, storeName: store.name });
        res.status(200).json({ success: true, message: 'Store deleted successfully' });

    } catch (error) {
        logError('Server error during store deletion', error, { storeId: req.params.id, userId: req.user.id });
        res.status(500).json({ success: false, message: 'Server error during store deletion' });
    }
};