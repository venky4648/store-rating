// config/database.js
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv'; // Import dotenv

dotenv.config(); // Load environment variables

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false, // Set to true to see SQL queries in console
    define: {
        timestamps: true, // Adds createdAt and updatedAt columns automatically
        underscored: true, // Use snake_case for column names
    },
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL Connection has been established successfully.');
        // Synchronize all models with the database
        await sequelize.sync(); // This will create tables if they don't exist
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the PostgreSQL database:', error);
        process.exit(1);
    }
};

export { sequelize, DataTypes, connectDB }; // Use named exports