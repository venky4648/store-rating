// backend/models/Store.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Store = sequelize.define('Store', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true,
        },
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // NEW: Add average rating column
    averageRating: {
        type: DataTypes.DECIMAL(3, 2), // e.g., 4.50 (3 total digits, 2 after decimal)
        allowNull: true, // Will be null if no ratings yet
        defaultValue: null,
    },
    // Foreign key to link to the User who owns this store
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
}, {
    tableName: 'stores',
    timestamps: true,
    underscored: true,
});

export default Store;