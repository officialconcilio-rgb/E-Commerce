const express = require('express');
const router = express.Router();
const {
    getOrders,
    getOrderById,
    createOrder,
    verifyPayment,
    handleFailedPayment,
    downloadInvoice
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET routes
router.get('/', getOrders);
router.get('/:id', getOrderById);

// POST routes
router.post('/', createOrder);
router.post('/verify', verifyPayment);
router.post('/failed', handleFailedPayment);

// Invoice download
router.get('/:id/invoice', downloadInvoice);

module.exports = router;
