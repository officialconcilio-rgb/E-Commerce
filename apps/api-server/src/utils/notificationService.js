const Notification = require('../models/Notification');

/**
 * Create a new administrative notification
 * @param {Object} data Notification data
 * @param {string} data.title Title of the notification
 * @param {string} data.message Message body
 * @param {string} data.type Type: 'Order', 'User', 'Inventory', 'System'
 * @param {string} data.link Internal link for admin panel
 */
exports.createAdminNotification = async ({ title, message, type = 'Order', link }) => {
    try {
        await Notification.create({
            title,
            message,
            type,
            link,
            recipients: ['All'] // Targeted at all admins by default
        });
        console.log(`[NOTIFICATION] ${type}: ${title}`);
    } catch (error) {
        console.error('[NOTIFICATION] Error creating notification:', error);
    }
};
