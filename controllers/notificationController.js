
const { sendNotification } = require('../services/notificationService'); 
const Notification = require('../models/notificationModel');

const sendNotifications = async (req, res) => {
    const message = {
        title: 'Thank You for Updating Information:',
        body: "Thanks for updating your voter information! You're ready for the upcoming election. Make sure to cast your vote!",
    }

    try {
        const userId = '6658a2e819086f196cd7c8a6';
        await sendNotification(userId , message);
        res.status(200).send('Notification sent successfully.');
    } catch (error) {
        res.status(500).send(error);
    }
}

const getNotifications = async (req, res) => {
    try {
        const user = req.user;
        const notifications = await Notification.findOne({ user_id: user.id });
        return res.status(200).json({
            status_code: 200,
            notifications,
        });

    } catch (error) {
        return res.status(500).json({
            status_code: 500,
            errors: error.message,
        });
    }
}

module.exports = {
    sendNotifications,
    getNotifications
}