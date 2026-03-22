const contactRepository = require('../repositories/contact.repository');

class ContactService {
  async submitMessage(data) {
    try {
      const message = await contactRepository.createMessage(data);
      return { success: true, data: message };
    } catch (error) {
      console.error('ContactService.submitMessage error:', error);
      return { success: false, error: { message: 'Failed to submit message', statusCode: 500 } };
    }
  }

  async getAllMessages(page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      const result = await contactRepository.getAllMessages(limit, offset);
      return { success: true, data: result };
    } catch (error) {
      console.error('ContactService.getAllMessages error:', error);
      return { success: false, error: { message: 'Failed to fetch messages', statusCode: 500 } };
    }
  }

  async updateStatus(id, status) {
    try {
      const allowedStatuses = ['unread', 'read', 'resolved'];
      if (!allowedStatuses.includes(status)) {
        return { success: false, error: { message: 'Invalid status', statusCode: 400 } };
      }
      const updated = await contactRepository.updateMessageStatus(id, status);
      if (!updated) {
        return { success: false, error: { message: 'Message not found', statusCode: 404 } };
      }
      return { success: true, data: updated };
    } catch (error) {
      console.error('ContactService.updateStatus error:', error);
      return { success: false, error: { message: 'Failed to update message status', statusCode: 500 } };
    }
  }
}

module.exports = new ContactService();
