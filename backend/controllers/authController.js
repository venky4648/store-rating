// controllers/authController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { logSuccess, logError, logInfo } from '../utils/logger.js'; // Ensure logInfo is imported here too

// Helper function to generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const { name, email, password, address, role } = req.body;

    try {
        let user = await User.findOne({ where: { email } });

        if (user) {
            logError('User registration failed: Email already exists', null, { email });
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        user = await User.create({
            name,
            email,
            password,
            address,
            role: role || 'Normal User',
        });

        const token = generateToken(user.id, user.role);

        logSuccess('User registered successfully', { userId: user.id, email: user.email, role: user.role });
        res.status(201).json({
            success: true,
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token,
        });
    } catch (error) {
        logError('Server error during user registration', error, { email: req.body.email });
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            logError('User login failed: Invalid credentials (email not found)', null, { email });
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            logError('User login failed: Invalid credentials (password mismatch)', null, { email });
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = generateToken(user.id, user.role);

        logSuccess('User logged in successfully', { userId: user.id, email: user.email, role: user.role });
        res.json({
            success: true,
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token,
        });
    } catch (error) {
        logError('Server error during user login', error, { email: req.body.email });
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc    Get authenticated user's profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    // The 'protect' middleware already attaches the user object to req.user
    // req.user contains the user's data (excluding password) from the database
    // and the role from the JWT.

    try {
        if (!req.user) {
            // This case should ideally be caught by the 'protect' middleware already,
            // but it's a good defensive check.
            logError('Get profile failed: User not found in request after token verification', null, { userId: req.user ? req.user.id : 'unknown' });
            return res.status(404).json({ success: false, message: 'User data not found.' });
        }

        logSuccess('User profile fetched successfully', { userId: req.user.id, email: req.user.email });
        res.status(200).json({
            success: true,
            _id: req.user.id, // Use id from req.user
            name: req.user.name,
            email: req.user.email,
            address: req.user.address,
            role: req.user.role,
            createdAt: req.user.createdAt,
            updatedAt: req.user.updatedAt,
        });
    } catch (error) {
        logError('Server error fetching user profile', error, { userId: req.user ? req.user.id : 'unknown' });
        res.status(500).json({ success: false, message: 'Server error fetching profile.' });
    }
};