const User = require("../../models/userModel");
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const validation = require('../../utils/validation/web_validation');
require('dotenv').config();

const login = async (req, res) => {
    try {
        // res.send({asda:'asda'});
        
        const schema = validation.login(req.body);
        if (schema.errored) {
            return res.status(400).json({
                'errors': schema.errors
            });
        }
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                status_code: 400,
                message: 'Authentication failed. User not found.',
            });
        }
        if (user.type !== 'admin') {
            return res.status(400).json({
                status_code: 400,
                message: 'Admin Login Failed',
            });
        }
        
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                status_code: 400,
                message: 'Authentication failed. Invalid email or password.',
            });
        }
        await user.save();

        const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });
        return res.status(200).json({
            status_code: 200,
            message: 'Authentication successful',
            user: user,
            token: token
        });
    } catch (error) {
        return res.status(400).json({
            status_code: 400,
            errors: error.message
        });
    }
}

module.exports = {
    login
}