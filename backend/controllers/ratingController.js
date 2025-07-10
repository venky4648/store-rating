// backend/controllers/ratingController.js
import Rating from '../models/Rating.js';
import Store from '../models/Store.js'; // Needed to potentially update store's average rating
import User from '../models/User.js'; // For including user data in responses
import { sequelize } from '../config/database.js'; // For aggregation

// @desc    Create a new rating
// @route   POST /api/ratings
// @access  Private (User)
export const createRating = async (req, res) => {
    const { storeId, rating, comment } = req.body;
    const userId = req.user.id; // From the protect middleware

    try {
        // Check if the user has already rated this store
        const existingRating = await Rating.findOne({
            where: { userId, storeId }
        });

        if (existingRating) {
            return res.status(400).json({ message: 'You have already rated this store. Please update your existing rating.' });
        }

        // Check if the store exists
        const storeExists = await Store.findByPk(storeId);
        if (!storeExists) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        const newRating = await Rating.create({
            userId,
            storeId,
            rating,
            comment,
        });

        // Optionally, update the average rating for the store immediately
        await updateStoreAverageRating(storeId);

        res.status(201).json({
            message: 'Rating created successfully',
            rating: newRating,
        });
    } catch (error) {
        console.error(error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'You have already rated this store. Please update your existing rating.' });
        }
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Get all ratings (e.g., for admin or a specific store)
// @route   GET /api/ratings
// @access  Public (or Private depending on requirements)
export const getAllRatings = async (req, res) => {
    try {
        const ratings = await Rating.findAll({
            include: [
                {
                    model: User,
                    as: 'rater',
                    attributes: ['id', 'name', 'email'], // Include specific user details
                },
                {
                    model: Store,
                    as: 'ratedStore',
                    attributes: ['id', 'name', 'address'], // Include specific store details
                },
            ],
            order: [['createdAt', 'DESC']], // Latest ratings first
        });
        res.status(200).json(ratings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Get ratings for a specific store
// @route   GET /api/stores/:storeId/ratings
// @access  Public
export const getRatingsByStoreId = async (req, res) => {
    const { storeId } = req.params;

    try {
        const storeExists = await Store.findByPk(storeId);
        if (!storeExists) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        const ratings = await Rating.findAll({
            where: { storeId },
            include: [
                {
                    model: User,
                    as: 'rater',
                    attributes: ['id', 'name', 'email'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json(ratings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};


// @desc    Get a single rating by ID
// @route   GET /api/ratings/:id
// @access  Public
export const getRatingById = async (req, res) => {
    const { id } = req.params;
    try {
        const rating = await Rating.findByPk(id, {
            include: [
                { model: User, as: 'rater', attributes: ['id', 'name', 'email'] },
                { model: Store, as: 'ratedStore', attributes: ['id', 'name', 'address'] },
            ],
        });
        if (!rating) {
            return res.status(404).json({ message: 'Rating not found.' });
        }
        res.status(200).json(rating);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Update a rating
// @route   PUT /api/ratings/:id
// @access  Private (Owner of the rating)
export const updateRating = async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id; // From the protect middleware

    try {
        const existingRating = await Rating.findByPk(id);

        if (!existingRating) {
            return res.status(404).json({ message: 'Rating not found.' });
        }

        // Ensure only the owner of the rating can update it
        if (existingRating.userId !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this rating.' });
        }

        existingRating.rating = rating || existingRating.rating;
        existingRating.comment = comment !== undefined ? comment : existingRating.comment; // Allow setting comment to null/empty

        await existingRating.save();

        // Update the store's average rating after an update
        await updateStoreAverageRating(existingRating.storeId);

        res.status(200).json({
            message: 'Rating updated successfully',
            rating: existingRating,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Delete a rating
// @route   DELETE /api/ratings/:id
// @access  Private (Owner of the rating or System Administrator)
export const deleteRating = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role; // From the protect middleware

    try {
        const ratingToDelete = await Rating.findByPk(id);

        if (!ratingToDelete) {
            return res.status(404).json({ message: 'Rating not found.' });
        }

        // Allow owner of the rating or System Administrator to delete
        if (ratingToDelete.userId !== userId && userRole !== 'System Administrator') {
            return res.status(403).json({ message: 'Not authorized to delete this rating.' });
        }

        const storeId = ratingToDelete.storeId; // Store ID before deletion

        await ratingToDelete.destroy();

        // Update the store's average rating after deletion
        await updateStoreAverageRating(storeId);

        res.status(200).json({ message: 'Rating deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// Helper function to calculate and update a store's average rating
async function updateStoreAverageRating(storeId) {
    try {
        const result = await Rating.findOne({
            attributes: [
                [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
            ],
            where: { storeId },
            group: ['storeId'], // Group by storeId to get average for that specific store
            raw: true, // Return plain data
        });

        const store = await Store.findByPk(storeId);
        if (store) {
            // Convert to a number and round (e.g., to 2 decimal places)
            store.averageRating = result ? parseFloat(result.averageRating).toFixed(2) : null;
            await store.save();
            console.log(`Updated average rating for store ${storeId} to ${store.averageRating}`);
        }
    } catch (error) {
        console.error(`Error updating average rating for store ${storeId}:`, error);
    }
}