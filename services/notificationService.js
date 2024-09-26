const mongoose = require('mongoose');
const admin = require('firebase-admin');
const firebaseSdk = require('../vote-america-llc-firebase-adminsdk.json');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');

admin.initializeApp({
    credential: admin.credential.cert(firebaseSdk),
});

const sendNotification = async (userId, message) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                status_code: 400,
                message: 'Invalid User Id',
            });
        }
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.fcm_token) {
            throw new Error('FCM token not available for the user');
        }

        const payload = {
            notification: {
                title: message.title,
                body: message.body,
            },
            token: user.fcm_token,
        };
        const notification = new Notification({
            user_id: userId,
            title: message.title,
            body: message.body,
        });
        await notification.save();
        const response = await admin.messaging().send(payload);
        console.log('Successfully sent message:', response);
    } catch (error) {
        console.error('Error sending message:', error);
    }
};

module.exports = { sendNotification };