const express = require('express');
const router = express.Router();
const { createProduct, updateOrderStatus, getAnalytics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('SuperAdmin', 'Manager'));

router.post('/products', createProduct);
router.get('/products/:id', require('../controllers/adminController').getProductById);
router.put('/products/:id', require('../controllers/adminController').updateProduct);
router.delete('/products/:id', require('../controllers/adminController').deleteProduct);

router.post('/categories', require('../controllers/adminController').createCategory);
router.put('/categories/:id', require('../controllers/adminController').updateCategory);
router.delete('/categories/:id', require('../controllers/adminController').deleteCategory);

router.get('/orders', require('../controllers/adminController').getOrders);
router.get('/orders/export', require('../controllers/adminController').exportOrdersCSV);
router.get('/orders/:id', require('../controllers/adminController').getOrder);
router.patch('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/refund', require('../controllers/adminController').initiateRefund);

router.post('/coupons', require('../controllers/adminController').createCoupon);
router.get('/coupons', require('../controllers/adminController').getCoupons);
router.delete('/coupons/:id', require('../controllers/adminController').deleteCoupon);

router.get('/customers', require('../controllers/adminController').getCustomers);
router.get('/customers/:id', require('../controllers/adminController').getCustomerWithOrders);
router.delete('/customers/:id', require('../controllers/adminController').deleteCustomer);

router.get('/analytics', getAnalytics);

// Notifications
const notificationCtrl = require('../controllers/notificationController');
router.get('/notifications', notificationCtrl.getNotifications);
router.patch('/notifications/read-all', notificationCtrl.markAllAsRead);
router.patch('/notifications/:id/read', notificationCtrl.markAsRead);
router.delete('/notifications/:id', notificationCtrl.deleteNotification);

module.exports = router;
