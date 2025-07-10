// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logError, logInfo, logDebug } from '../utils/logger.js'; // Assuming you have logError

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            console.log('[DEBUG Protect] Received Token:', token); // DEBUG LOG 1

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            console.log('[DEBUG Protect] Decoded Token:', decoded); // DEBUG LOG 2

            // Get user from the token payload (excluding password)
            const user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            if (!user) {
                logError('Auth Failed: User not found from token ID.', null, { decodedId: decoded.id });
                return res.status(401).json({ message: 'Not authorized, user not found' }); // Explicitly return 401
            }

            // Check if user role matches the decoded role (optional, but good)
            if (user.role !== decoded.role) {
                logError('Auth Failed: Token role mismatch.', null, { userId: user.id, userRole: user.role, decodedRole: decoded.role });
                return res.status(401).json({ message: 'Not authorized, token role mismatch' }); // Explicitly return 401
            }

            req.user = user; // Attach the user object to the request

            console.log('[DEBUG Protect] User attached to request:', req.user.id, req.user.role); // DEBUG LOG 3

            next(); // Proceed to the next middleware/route handler
        } catch (error) {
            logError('Auth Failed: Token verification error.', error, { token: token });
            // More specific error for debugging expired tokens
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Not authorized, token expired' });
            }
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        logError('Auth Failed: No token in header.', null, {});
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const authorizeRoles = (...roles) => { // <-- EXPORT THIS FUNCTION
    return (req, res, next) => {
        // req.user should be available from the 'protect' middleware
        if (!req.user) {
            logError('Authorization Failed: No user found on request (protect middleware likely failed before authorizeRoles).', null, {});
            return res.status(401).json({ message: 'Not authorized: No user data found.' });
        }

        // Check if the user's role is included in the allowed roles
        if (!roles.includes(req.user.role)) {
            logError('Authorization Failed: User role not allowed for this action.', null, { userId: req.user.id, userRole: req.user.role, requiredRoles: roles });
            return res.status(403).json({ message: 'Forbidden: You do not have the necessary permissions to access this route.' });
        }
        
        logInfo('Authorization successful for role', { userId: req.user.id, userRole: req.user.role, routeRoles: roles }); // Optional: log successful auth
        next(); // User has the required role, proceed to the next middleware/route handler
    };
};