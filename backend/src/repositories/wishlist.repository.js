/**
 * Wishlist Repository — database queries for wishlists table.
 */

const { query } = require('../database/db');

const wishlistRepository = {
  /**
   * Get all wishlist items for a user with joined medicine data.
   */
  async getWishlistItems(userId) {
    const { rows } = await query(
      `SELECT
         w.id,
         w.user_id,
         w.medicine_id,
         w.created_at,
         m.name             AS medicine_name,
         m.generic_name     AS medicine_generic_name,
         m.category         AS medicine_category,
         m.manufacturer     AS medicine_manufacturer,
         m.price            AS medicine_price,
         m.stock            AS medicine_stock,
         m.image_url        AS medicine_image_url,
         m.requires_prescription AS medicine_requires_prescription,
         m.description      AS medicine_description
       FROM wishlists w
       JOIN medicines m ON m.id = w.medicine_id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [userId]
    );
    return rows;
  },

  /**
   * Check if a medicine is in the user's wishlist.
   */
  async findItem(userId, medicineId) {
    const { rows } = await query(
      'SELECT * FROM wishlists WHERE user_id = $1 AND medicine_id = $2',
      [userId, medicineId]
    );
    return rows[0] || null;
  },

  /**
   * Add a medicine to the user's wishlist.
   */
  async addItem(userId, medicineId) {
    const { rows } = await query(
      `INSERT INTO wishlists (user_id, medicine_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, medicine_id) DO NOTHING
       RETURNING *`,
      [userId, medicineId]
    );
    return rows[0] || null;
  },

  /**
   * Remove a medicine from the user's wishlist.
   */
  async removeItem(userId, medicineId) {
    const { rows } = await query(
      'DELETE FROM wishlists WHERE user_id = $1 AND medicine_id = $2 RETURNING id',
      [userId, medicineId]
    );
    return rows[0] || null;
  },

  /**
   * Clear all items from the user's wishlist.
   */
  async clearWishlist(userId) {
    await query('DELETE FROM wishlists WHERE user_id = $1', [userId]);
  },

  /**
   * Get wishlist medicine IDs for a user (for quick lookup).
   */
  async getWishlistIds(userId) {
    const { rows } = await query(
      'SELECT medicine_id FROM wishlists WHERE user_id = $1',
      [userId]
    );
    return rows.map((r) => r.medicine_id);
  },
};

module.exports = wishlistRepository;
