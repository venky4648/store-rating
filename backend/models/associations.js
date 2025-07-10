// backend/models/associations.js

import User from './User.js';
import Store from './Store.js';
import Rating from './Rating.js';

// --- User Associations ---
// A User can own many Stores
User.hasMany(Store, {
    foreignKey: 'userId', // The foreign key in the Store model
    as: 'ownedStores', // Alias for when including (e.g., User.findAll({ include: 'ownedStores' }))
    onDelete: 'CASCADE', // If a user is deleted, their stores are also deleted
    onUpdate: 'CASCADE'
});

// A User can give many Ratings
User.hasMany(Rating, {
    foreignKey: 'userId', // The foreign key in the Rating model
    as: 'givenRatings', // Alias for when including (e.g., User.findAll({ include: 'givenRatings' }))
    onDelete: 'SET NULL', // If a user is deleted, their ratings might be kept but userId set to NULL
    onUpdate: 'CASCADE'
});


// --- Store Associations ---
// A Store belongs to one User (its owner)
Store.belongsTo(User, {
    foreignKey: 'userId', // The foreign key in the Store model
    as: 'owner', // Alias for when including (e.g., Store.findAll({ include: 'owner' }))
    // Note: onDelete is defined in User.hasMany(Store)
});

// A Store can have many Ratings
Store.hasMany(Rating, {
    foreignKey: 'storeId', // The foreign key in the Rating model
    as: 'ratings', // Alias for when including (e.g., Store.findAll({ include: 'ratings' }))
    onDelete: 'CASCADE', // If a store is deleted, its ratings are also deleted
    onUpdate: 'CASCADE'
});


// --- Rating Associations ---
// A Rating belongs to one User (the one who gave the rating)
Rating.belongsTo(User, {
    foreignKey: 'userId', // The foreign key in the Rating model
    as: 'rater', // Alias for when including (e.g., Rating.findAll({ include: 'rater' }))
    // Note: onDelete is defined in User.hasMany(Rating)
});

// A Rating belongs to one Store (the store being rated)
Rating.belongsTo(Store, {
    foreignKey: 'storeId', // The foreign key in the Rating model
    as: 'ratedStore', // Alias for when including (e.g., Rating.findAll({ include: 'store' }))
    // Note: onDelete is defined in Store.hasMany(Rating)
});


// You don't need to export anything from here, just running this file sets up associations.
// However, if you wanted to explicitly run them (e.g., in index.js), you could export a function.
// For now, simply importing this file will execute the associations.