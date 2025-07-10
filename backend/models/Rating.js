// backend/models/Rating.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Rating = sequelize.define('Rating', {
    // ... (other attributes) ...
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    storeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'stores',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
}, {
    tableName: 'ratings',
    timestamps: true,
    underscored: true, // This is why it's expecting snake_case in the DB
    indexes: [
        // Ensure a user can only rate a specific store once
        {
            unique: true,
            // CHANGE THESE FIELD NAMES TO SNAKE_CASE:
            fields: ['user_id', 'store_id'] // <-- FIX IS HERE!
        }
    ]
});

export default Rating;