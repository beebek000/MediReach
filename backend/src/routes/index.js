const { Router } = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const medicineRoutes = require('./medicine.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
const paymentRoutes = require('./payment.routes');
const statsRoutes = require('./stats.routes');
const prescriptionRoutes = require('./prescription.routes');
const wishlistRoutes = require('./wishlist.routes');
const { chat, transcribe } = require('../controllers/chat.controller');
const contactRoutes = require('./contact.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/medicines', medicineRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/stats', statsRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/contact', contactRoutes);
router.post('/chat', chat);
router.post('/chat/transcribe', transcribe);

// Health check
router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'MediReach API is running', timestamp: new Date().toISOString() });
});

module.exports = router;
