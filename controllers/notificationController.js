
const { sendNotification } = require('../services/notificationService'); 
const Notification = require('../models/notificationModel');

const sendNotifications = async (req, res) => {
    const message = {
        title: 'Thank You for Updating Information:',
        body: "Thanks for updating your voter information! You're ready for the upcoming election. Make sure to cast your vote!",
    }

    try {
        const userId = '66e45fec2fde5bd30cbe61d7';
        await sendNotification(userId , message);
        res.status(200).send('Notification sent successfully.');
    } catch (error) {
        res.status(500).send(error);
    }
}

const getNotifications = async (req, res) => {
    try {
        // Get the current date and calculate the start and end of the day
        const date = new Date(); // current date
        const startOfDay = new Date(date.setHours(0, 0, 0, 0)); // start of the day
        const endOfDay = new Date(date.setHours(23, 59, 59, 999)); // end of the day
        const user = req.user;
        const todaysNotifications = await Notification.find({
            user_id:user.id,
            created_at:{
                $gte:startOfDay,
                $lte:endOfDay,
        }});
        const olderNotifications = await Notification.find({
            user_id:user.id,
            created_at:{
                $lt:startOfDay,
        }});

        const formattedNotifications = {
            today:todaysNotifications.map(notification => ({
                _id: notification._id,
                user_id: notification.user_id,
                title: notification.title,
                body: notification.body,
                created_at: notification.created_at,
            })),
            older:olderNotifications.map(notification => ({
                _id: notification._id,
                user_id: notification.user_id,
                title: notification.title,
                body: notification.body,
                created_at: notification.created_at,
            })),
            
        }
        return res.status(200).json({
            status_code: 200,
            formattedNotifications,
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