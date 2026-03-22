/**
 * Wishlist Validators — Zod schemas
 */

const { z } = require('zod');

const wishlistItemSchema = z.object({
  medicineId: z
    .string({ required_error: 'medicineId is required' })
    .uuid('medicineId must be a valid UUID'),
});

module.exports = { wishlistItemSchema };
