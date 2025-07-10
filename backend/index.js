// backend/index.js (or server.js)

import express from 'express';
import dotenv from 'dotenv';
dotenv.config(); 
import cors from 'cors'; // For handling Cross-Origin Resource Sharing
import { connectDB } from './config/database.js';
import { logInfo, logError } from './utils/logger.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import storeRoutes from './routes/storeRoutes.js'; // You'll integrate these later
import ratingRoutes from './routes/ratingRoutes.js'; // You'll integrate these later

// Load environment variables from .env file

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json()); // For parsing application/json
app.use(cors()); // Enable CORS for all routes


// Define routes

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
 // Uncomment when you have storeRoutes.js
app.use('/api/ratings', ratingRoutes);

import './models/associations.js'// Uncomment when you have ratingRoutes.js

// Basic route for testing server status
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling middleware (optional, but good practice)
app.use((err, req, res, next) => {
    logError('Unhandled server error:', err, { path: req.path, method: req.method });
    res.status(500).json({
        success: false,
        message: 'Something went wrong on the server.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined, // Send error message only in dev
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    logInfo(`Server running on port ${PORT}`);
    logInfo(`Environment: ${process.env.NODE_ENV}`);
});