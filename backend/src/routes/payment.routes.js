/**
 * Payment Routes — /api/payments
 *
 * POST   /esewa/initiate        — customer: get eSewa form data
 * GET    /esewa/verify          — callback verification via encoded data
 * GET    /order/:orderId       — authenticated: get payment records for order
 */

const { Router } = require('express');
const paymentController = require('../controllers/payment.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const {
  initiatePaymentSchema,
} = require('../validators/cart.validator');

const router = Router();

router.use(authenticate);

// eSewa
router.post(
  '/esewa/initiate',
  authorize('customer'),
  validate(initiatePaymentSchema),
  paymentController.initiateEsewa
);
router.get(
  '/esewa/verify',
  authorize('customer'),
  paymentController.verifyEsewa
);

// Shared
router.get(
  '/order/:orderId',
  paymentController.getOrderPayments
);

module.exports = router;
