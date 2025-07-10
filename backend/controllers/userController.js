// backend/controllers/userController.js

import User from '../models/User.js';
import { logSuccess, logError, logInfo, logDebug } from '../utils/logger.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (System Administrator only)
export const getAllUsers = async (req, res) => {
    try {
        // Find all users and exclude their passwords for security
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });

        if (!users || users.length === 0) {
            logInfo('No users found in the database.', null, { userId: req.user ? req.user.id : 'unauthenticated' });
            return res.status(404).json({ success: false, message: 'No users found.' });
        }

        logSuccess('All users fetched successfully', { count: users.length, requestedByUserId: req.user.id });
        res.status(200).json({
            success: true,
            users: users.map(user => user.toJSON()) // Convert Sequelize instances to plain JSON objects
        });
    } catch (error) {
        logError('Server error fetching all users', error, { userId: req.user ? req.user.id : 'unknown' });
        res.status(500).json({ success: false, message: 'Server error fetching users.' });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (System Administrator only)
export const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            logInfo(`User not found with ID: ${req.params.id}`, null, { requestedByUserId: req.user.id });
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        logSuccess(`User fetched successfully: ${user.id}`, { requestedByUserId: req.user.id });
        res.status(200).json({ success: true, user: user.toJSON() });
    } catch (error) {
        logError(`Server error fetching user with ID: ${req.params.id}`, error, { requestedByUserId: req.user.id });
        res.status(500).json({ success: false, message: 'Server error fetching user.' });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (System Administrator only)
export const updateUser = async (req, res) => {
    const { name, email, password, address, role } = req.body;
    const userId = req.params.id;

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            logInfo(`Update user failed: User not found with ID: ${userId}`, null, { requestedByUserId: req.user.id });
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if email is being changed to an email that already exists
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser && existingUser.id !== userId) {
                logError('Update user failed: Email already exists for another user', null, { userId: userId, newEmail: email });
                return res.status(400).json({ success: false, message: 'Email already exists for another user.' });
            }
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.address = address || user.address;
        user.role = role || user.role;
        // Password will be hashed by the beforeUpdate hook if changed
        if (password) {
            user.password = password;
        }

        await user.save(); // This triggers the beforeUpdate hook for password hashing

        logSuccess(`User updated successfully: ${user.id}`, { requestedByUserId: req.user.id });
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: user.toJSON() // Return updated user, excluding password
        });

    } catch (error) {
        logError(`Server error updating user with ID: ${userId}`, error, { requestedByUserId: req.user.id, updateData: req.body });
        res.status(500).json({ success: false, message: 'Server error updating user.' });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (System Administrator only)
export const deleteUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            logInfo(`Delete user failed: User not found with ID: ${userId}`, null, { requestedByUserId: req.user.id });
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await user.destroy();

        logSuccess(`User deleted successfully: ${userId}`, { requestedByUserId: req.user.id });
        res.status(200).json({ success: true, message: 'User deleted successfully' });

    } catch (error) {
        logError(`Server error deleting user with ID: ${userId}`, error, { requestedByUserId: req.user.id });
        res.status(500).json({ success: false, message: 'Server error deleting user.' });
    }
};