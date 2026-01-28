const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['Order', 'User', 'Inventory', 'System'],
        default: 'Order'
    },
    link: String, // Path in admin panel, e.g., /orders/123
    isRead: { type: Boolean, default: false },
    recipients: [{
        type: String,
        enum: ['SuperAdmin', 'Manager', 'Editor', 'All'],
        default: 'All'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
