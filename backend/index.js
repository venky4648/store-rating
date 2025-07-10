// backend/index.js (or app.js)
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js'; // NEW: Import rating routes
import { protect, authorizeRoles } from './middleware/authMiddleware.js';

// 1. IMPORT ALL MODELS FIRST to ensure they are defined in Sequelize
import User from './models/User.js';
import Store from './models/Store.js';
import Rating from './models/Rating.js'; // NEW: Import Rating model

// 2. Then, import the file that sets up associations (after models are defined)
import './models/associations.js';

// Load environment variables
dotenv.config();

const app = express();

app.use(express.json());

// Connect to PostgreSQL and sync models
connectDB();

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Store Routes
app.use('/api/stores', storeRoutes);

// NEW: Rating Routes
app.use('/api/ratings', ratingRoutes); // Use the new rating routes

// Example of a protected route (only for authenticated users)
app.get('/api/profile', protect, (req, res) => {
    res.json({ message: 'Welcome to your profile!', user: req.user });
});

// Example of a role-specific protected route (only for System Administrators)
app.get('/api/admin/users', protect, authorizeRoles('System Administrator'), (req, res) => {
    res.json({ message: 'Admin users list - accessible only by System Administrator' });
});

// Example of a role-specific protected route (only for Store Owners or Admins)
app.get('/api/store-data', protect, authorizeRoles('Store Owner', 'System Administrator'), (req, res) => {
    res.json({ message: 'Store specific data - accessible by Store Owners and System Administrators' });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});