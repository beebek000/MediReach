/**
 * Payment Service — business logic for COD and eSewa payments.
 *
 * eSewa flow:
 *   1. Frontend calls POST /api/payments/esewa/initiate
 *      → backend returns signed form data for eSewa checkout
 *   2. Frontend submits form to eSewa checkout URL
 *   3. eSewa redirects to success/failure URL with base64-encoded `data` param
 *   4. Frontend calls GET /api/payments/esewa/verify?data=...
 *      → backend verifies signature and transaction status
 *
 * COD flow:
 *   1. Checkout sets paymentMethod = 'cod' and paymentStatus = 'pending'
 *   2. On delivery, admin marks order delivered → payment status becomes 'paid'
 */

const crypto = require('crypto');
const config = require('../config');
const paymentRepository = require('../repositories/payment.repository');
const orderRepository = require('../repositories/order.repository');
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
} = require('../utils/errors');

/* ================================================================
   HELPER: generate eSewa Signature
   ================================================================ */
function generateEsewaSignature(secretKey, dataString) {
  return crypto
    .createHmac('sha256', secretKey)
    .update(dataString)
    .digest('base64');
}

/* ================================================================
   HELPER: generate idempotency key for a payment attempt
   ================================================================ */
function makeIdempotencyKey(orderId, method) {
  return `${orderId}:${method}:${Date.now()}`;
}

function parseAmount(value) {
  return Number.parseFloat(value).toFixed(2);
}

const paymentService = {
  /* ──────────────────────────────────────────────── COD ─────────── */
  async createCodPayment(orderId, amount) {
    const existing = await paymentRepository.findByOrderId(orderId);
    const alreadyPaid = existing.find((p) => p.status === 'success');
    if (alreadyPaid) throw new ConflictError('Order already paid');

    return paymentRepository.create({
      orderId,
      method: 'cod',
      amount,
      status: 'pending',
      idempotencyKey: makeIdempotencyKey(orderId, 'cod'),
    });
  },

  async markCodPaid(orderId) {
    const payments = await paymentRepository.findByOrderId(orderId);
    const codPayment = payments.find((p) => p.method === 'cod' && p.status === 'pending');
    if (!codPayment) throw new NotFoundError('No pending COD payment found');

    await paymentRepository.updateStatus(codPayment.id, {
      status: 'success',
      transactionId: `COD-${orderId.slice(0, 8)}`,
    });

    await orderRepository.updatePaymentStatus(orderId, 'paid');
    return { message: 'COD payment marked as paid' };
  },

  /* ──────────────────────────────────────────────── eSewa ───────── */

  /**
   * Initiate eSewa payment.
   * Generates signature and returns form data for frontend to submit.
   */
  async initiateEsewa(orderId, userId) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');
    if (order.user_id !== userId) throw new BadRequestError('Access denied');
    if (order.payment_method !== 'esewa') {
      throw new BadRequestError('Order payment method is not eSewa');
    }
    if (order.payment_status === 'paid') {
      throw new ConflictError('Order already paid');
    }

    const { productCode, secretKey, initiateUrl } = config.esewa;
    const transactionUuid = `${order.id.slice(0, 8)}-${Date.now()}`;
    const totalAmount = parseAmount(order.grand_total);

    // Generate Signature: total_amount=X,transaction_uuid=Y,product_code=Z
    const dataString = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    const signature = generateEsewaSignature(secretKey, dataString);

    // Persist pending payment
    const idempotencyKey = makeIdempotencyKey(orderId, 'esewa');
    await paymentRepository.create({
      orderId,
      method: 'esewa',
      amount: order.grand_total,
      status: 'pending',
      transactionId: transactionUuid,
      idempotencyKey,
    });

    if (config.esewa.mock) {
      return {
        paymentUrl: `${config.clientUrl}/customer/payment/esewa/mock-checkout`,
        formData: {
          amount: totalAmount,
          tax_amount: '0',
          total_amount: totalAmount,
          transaction_uuid: transactionUuid,
          product_code: productCode,
          product_service_charge: '0',
          product_delivery_charge: '0',
          success_url: `${config.clientUrl}/customer/payment/esewa/success`,
          failure_url: `${config.clientUrl}/customer/payment/esewa/failure`,
          signed_field_names: 'total_amount,transaction_uuid,product_code',
          signature,
        },
        mock: true,
      };
    }

    return {
      paymentUrl: initiateUrl,
      formData: {
        amount: totalAmount,
        tax_amount: '0',
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: productCode,
        product_service_charge: '0',
        product_delivery_charge: '0',
        success_url: `${config.clientUrl}/customer/payment/esewa/success`,
        failure_url: `${config.clientUrl}/customer/payment/esewa/failure`,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature,
      },
    };
  },

  /**
   * Verify eSewa payment callback.
   * eSewa redirects to success_url with a base64 encoded 'encodedData' string.
   */
  async verifyEsewa(encodedData) {
    let decoded;
    try {
      const json = Buffer.from(encodedData, 'base64').toString('utf-8');
      decoded = JSON.parse(json);
    } catch {
      throw new BadRequestError('Invalid eSewa response data');
    }

    const {
      transaction_uuid,
      total_amount,
      status,
      signature,
      transaction_code,
      signed_field_names,
    } = decoded;
    const { productCode, secretKey } = config.esewa;

    if (!transaction_uuid || !total_amount || !status || !signature) {
      throw new BadRequestError('Incomplete eSewa response data');
    }

    const signedFieldNames =
      signed_field_names ||
      'transaction_code,status,total_amount,transaction_uuid,product_code';
    const dataString =
      `transaction_code=${transaction_code || ''},status=${status},total_amount=${total_amount},` +
      `transaction_uuid=${transaction_uuid},product_code=${productCode},signed_field_names=${signedFieldNames}`;
    const expectedSignature = generateEsewaSignature(secretKey, dataString);

    if (signature !== expectedSignature && !config.esewa.mock) {
      throw new BadRequestError('eSewa signature verification failed');
    }

    const payment = await paymentRepository.findByTransactionId(transaction_uuid);
    if (!payment) throw new NotFoundError('Payment record not found');
    if (payment.status === 'success') return { message: 'Payment already verified', orderId: payment.order_id };

    if (status === 'COMPLETE' || config.esewa.mock) {
      if (!config.esewa.mock) {
        const url = new URL(config.esewa.statusUrl);
        url.searchParams.set('product_code', productCode);
        url.searchParams.set('total_amount', total_amount);
        url.searchParams.set('transaction_uuid', transaction_uuid);

        const statusRes = await fetch(url.toString(), {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        if (!statusRes.ok) {
          throw new BadRequestError('Unable to validate eSewa payment status');
        }

        const statusPayload = await statusRes.json().catch(() => null);
        if (!statusPayload || statusPayload.status !== 'COMPLETE') {
          throw new BadRequestError('eSewa transaction is not complete');
        }
      }

      await paymentRepository.updateStatus(payment.id, {
        status: 'success',
        providerRef: transaction_code || transaction_uuid,
        providerResponse: decoded,
      });
      await orderRepository.updatePaymentStatus(payment.order_id, 'paid');

      const order = await orderRepository.findById(payment.order_id);
      if (order && order.status === 'pending') {
        await orderRepository.updateStatus(payment.order_id, 'verified');
      }

      return { message: 'Payment verified successfully', orderId: payment.order_id };
    }

    await paymentRepository.updateStatus(payment.id, {
      status: 'failed',
      providerResponse: decoded,
    });
    await orderRepository.updatePaymentStatus(payment.order_id, 'failed');
    throw new BadRequestError(`eSewa payment ${status}`);
  },

  /* ──────────────────────────────────────────── Shared ──────────── */
  async getOrderPayments(orderId) {
    const payments = await paymentRepository.findByOrderId(orderId);
    return payments.map((p) => ({
      id: p.id,
      orderId: p.order_id,
      method: p.method,
      amount: parseFloat(p.amount),
      status: p.status,
      transactionId: p.transaction_id,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
  },
};

module.exports = paymentService;

