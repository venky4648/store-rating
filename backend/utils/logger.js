// utils/logger.js

// Function to log success messages
export const logSuccess = (message, data = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[SUCCESS] ${timestamp}: ${message}`, data);
};

// Function to log error messages
export const logError = (message, error = {}, data = {}) => {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] ${timestamp}: ${message}`, error, data);
};

// Function to log informational messages (e.g., for general flow)
export const logInfo = (message, data = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] ${timestamp}: ${message}`, data);
};