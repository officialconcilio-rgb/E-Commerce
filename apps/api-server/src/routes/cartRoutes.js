const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getCart);
router.post('/add', addToCart);
router.patch('/update', updateCartItem);

module.exports = router;
