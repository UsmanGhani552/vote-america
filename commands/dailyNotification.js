var cron = require('node-cron');
const { sendNotification } = require('../services/notificationService');
const User = require('../models/userModel');

const sendDailyNotification = async () => {
    const message = {
        title: 'Thank You for Staying Informed:',
        body:  "Thanks for staying informed! Your engagement keeps our democracy strong. Don’t forget to vote and make your voice heard!",
    }

    try {
        // Fetch all users with type 'user'
        const users = await User.find({ type: 'user' });

        // Loop through each user and send notification
        for (const user of users) {
            await sendNotification(user._id, message);
        }
        console.log('Notifications sent successfully.');
    } catch (error) {
        console.error('Error sending notifications:', error);
    }
}

const job = cron.schedule('0 0 0 * * * *', () => {
//   console.log('running a task every minute');
  sendDailyNotification();
});

job.start();