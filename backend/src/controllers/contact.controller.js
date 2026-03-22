const contactService = require('../services/contact.service');
const { success, created } = require('../utils/response');

class ContactController {
  async submitMessage(req, res) {
    const { name, email, message } = req.body;
    const result = await contactService.submitMessage({ name, email, message });
    if (result.success) {
      return created(res, result.data, 'Message sent successfully');
    }
    return res.status(result.error?.statusCode || 500).json({ success: false, message: result.error?.message || 'Failed to submit message' });
  }

  async adminGetMessages(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await contactService.getAllMessages(page, limit);
    if (result.success) {
      return success(res, result.data);
    }
    return res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }

  async adminUpdateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const result = await contactService.updateStatus(id, status);
    if (result.success) {
      return success(res, result.data, 'Status updated');
    }
    return res.status(result.error?.statusCode || 500).json({ success: false, message: result.error?.message || 'Failed to update status' });
  }
}

module.exports = new ContactController();
