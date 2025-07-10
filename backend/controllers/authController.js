// controllers/authController.js
import User from '../models/User.js';import jwt from 'jsonwebtoken';
import { logSuccess, logError } from '../utils/logger.js'; // Import the logger

// Helper function to generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1h',
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
                success: false, // Add success flag
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
            success: true, // Add success flag
            _id: user.id, // Changed from _id to id for consistency with Sequelize
            name: user.name,
            email: user.email,
            role: user.role,
            token: token,
        });
    } catch (error) {
        logError('Server error during user registration', error, { email: req.body.email });
        res.status(500).json({
            success: false, // Add success flag
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
                success: false, // Add success flag
                message: 'Invalid credentials'
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            logError('User login failed: Invalid credentials (password mismatch)', null, { email });
            return res.status(400).json({
                success: false, // Add success flag
                message: 'Invalid credentials'
            });
        }

        const token = generateToken(user.id, user.role);

        logSuccess('User logged in successfully', { userId: user.id, email: user.email, role: user.role });
        res.json({
            success: true, // Add success flag
            _id: user.id, // Changed from _id to id for consistency with Sequelize
            name: user.name,
            email: user.email,
            role: user.role,
            token: token,
        });
    } catch (error) {
        logError('Server error during user login', error, { email: req.body.email });
        res.status(500).json({
            success: false, // Add success flag
            message: 'Server error during login'
        });
    }
};