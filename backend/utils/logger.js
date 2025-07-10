// backend/utils/logger.js

import moment from 'moment-timezone';

const getTimestamp = () => {
    return moment().tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
};

export const logInfo = (message, context = {}) => {
    console.log(`[INFO] ${getTimestamp()}: ${message}`, context);
};

export const logSuccess = (message, context = {}) => {
    console.log(`[SUCCESS] ${getTimestamp()}: ${message}`, context);
};

export const logError = (message, error = null, context = {}) => {
    console.error(`[ERROR] ${getTimestamp()}: ${message}`, error, context);
};

export const logDebug = (message, context = {}) => { // <--- ENSURE THIS IS PRESENT AND EXPORTED
    // Only log debug messages in development environment
    if (process.env.NODE_ENV === 'development') {
        console.log(`[DEBUG] ${getTimestamp()}: ${message}`, context);
    }
};