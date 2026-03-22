const { z } = require('zod');

const submitMessageSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(150),
  email: z.string().email('Invalid email address').max(255),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

const updateStatusSchema = z.object({
  status: z.enum(['unread', 'read', 'resolved'], {
    errorMap: () => ({ message: 'Status must be one of: unread, read, resolved' }),
  }),
});

module.exports = { submitMessageSchema, updateStatusSchema };
