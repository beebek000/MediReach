/**
 * Payment Controller — HTTP handlers for /api/payments
 */

const paymentService = require('../services/payment.service');
const { success } = require('../utils/response');

const paymentController = {
  /* ─────────────────────────────── eSewa ───────────────────────────── */

  /**
   * POST /api/payments/esewa/initiate
   * Body: { orderId }
   */
  async initiateEsewa(req, res, next) {
    try {
      const { orderId } = req.body;
      const result = await paymentService.initiateEsewa(orderId, req.user.userId);
      return success(res, result, 'eSewa payment initiated');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/payments/esewa/verify
   * Query: { data } (encodedData from eSewa)
   */
  async verifyEsewa(req, res, next) {
    try {
      const { data } = req.query;
      const result = await paymentService.verifyEsewa(data);
      return success(res, result, 'eSewa payment verified');
    } catch (err) {
      next(err);
    }
  },

  /* ─────────────────────────────── Shared ────────────────────────── */

  /**
   * GET /api/payments/order/:orderId
   * Get all payment records for an order.
   */
  async getOrderPayments(req, res, next) {
    try {
      const payments = await paymentService.getOrderPayments(req.params.orderId);
      return success(res, { payments });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = paymentController;
