// backend/models/associations.js
import User from './User.js';
import Store from './Store.js';
import Rating from './Rating.js'; // Import the new Rating model

// Define associations here, AFTER all models have been imported and initialized

// User to Store (Owner)
User.hasMany(Store, { foreignKey: 'userId', as: 'stores' });
Store.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

// User to Rating (A user can make many ratings)
User.hasMany(Rating, { foreignKey: 'userId', as: 'ratingsMade' });
Rating.belongsTo(User, { foreignKey: 'userId', as: 'rater' });

// Store to Rating (A store can have many ratings)
Store.hasMany(Rating, { foreignKey: 'storeId', as: 'reviews' }); // Using 'reviews' as alias for clarity
Rating.belongsTo(Store, { foreignKey: 'storeId', as: 'ratedStore' });

export default {};