const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { submitMessageSchema, updateStatusSchema } = require('../validators/contact.validator');

// Public: anyone can submit a contact message
router.post(
  '/',
  validate(submitMessageSchema),
  (req, res) => contactController.submitMessage(req, res)
);

// Admin only: get all messages
router.get(
  '/',
  authenticate,
  authorize('admin'),
  (req, res) => contactController.adminGetMessages(req, res)
);

// Admin only: update message status
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  validate(updateStatusSchema),
  (req, res) => contactController.adminUpdateStatus(req, res)
);

module.exports = router;
