const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const verifyToken = async (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers['authorization'];

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Token is required',
        });
    }
    try {
        const decoded = jwt.verify(token, 'secret_key');
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
        }
        req.user = user; // Attach the user object to the request
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

module.exports = {
    verifyToken,
};