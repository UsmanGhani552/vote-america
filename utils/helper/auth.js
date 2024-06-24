const jwt = require('jsonwebtoken');

const getUserFromToken = (token) => {
    try {
        const decoded = jwt.verify(token,'secret_key');
        return decoded;
    } catch (error) {
        // Handle invalid or expired token
        return null;
    }
};

module.exports = {
    getUserFromToken
};