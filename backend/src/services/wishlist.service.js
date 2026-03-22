/**
 * Wishlist Service — business logic for the wishlist feature.
 */

const wishlistRepository = require('../repositories/wishlist.repository');
const medicineRepository = require('../repositories/medicine.repository');
const { NotFoundError, ConflictError } = require('../utils/errors');

/**
 * Format a DB wishlist row → frontend-friendly object.
 */
function formatWishlistItem(row) {
  return {
    id: row.id,
    medicineId: row.medicine_id,
    name: row.medicine_name,
    genericName: row.medicine_generic_name,
    category: row.medicine_category,
    manufacturer: row.medicine_manufacturer,
    price: parseFloat(row.medicine_price),
    stock: row.medicine_stock,
    imageUrl: row.medicine_image_url,
    requiresPrescription: row.medicine_requires_prescription,
    description: row.medicine_description,
    addedAt: row.created_at,
  };
}

const wishlistService = {
  /**
   * Get all wishlist items for a user.
   */
  async getWishlist(userId) {
    const items = await wishlistRepository.getWishlistItems(userId);
    return {
      items: items.map(formatWishlistItem),
      itemCount: items.length,
    };
  },

  /**
   * Get just the medicine IDs in the user's wishlist (for quick checks).
   */
  async getWishlistIds(userId) {
    return wishlistRepository.getWishlistIds(userId);
  },

  /**
   * Add a medicine to the wishlist.
   */
  async addItem(userId, medicineId) {
    // Validate medicine exists
    const medicine = await medicineRepository.findById(medicineId);
    if (!medicine) throw new NotFoundError('Medicine not found');

    // Check if already in wishlist
    const existing = await wishlistRepository.findItem(userId, medicineId);
    if (existing) throw new ConflictError('Medicine is already in your wishlist');

    await wishlistRepository.addItem(userId, medicineId);
    return this.getWishlist(userId);
  },

  /**
   * Remove a medicine from the wishlist.
   */
  async removeItem(userId, medicineId) {
    const removed = await wishlistRepository.removeItem(userId, medicineId);
    if (!removed) throw new NotFoundError('Item not in wishlist');
    return this.getWishlist(userId);
  },

  /**
   * Toggle a medicine in/out of the wishlist.
   */
  async toggleItem(userId, medicineId) {
    const medicine = await medicineRepository.findById(medicineId);
    if (!medicine) throw new NotFoundError('Medicine not found');

    const existing = await wishlistRepository.findItem(userId, medicineId);
    if (existing) {
      await wishlistRepository.removeItem(userId, medicineId);
      const wishlist = await this.getWishlist(userId);
      return { ...wishlist, action: 'removed' };
    } else {
      await wishlistRepository.addItem(userId, medicineId);
      const wishlist = await this.getWishlist(userId);
      return { ...wishlist, action: 'added' };
    }
  },

  /**
   * Clear all items from the wishlist.
   */
  async clearWishlist(userId) {
    await wishlistRepository.clearWishlist(userId);
    return { items: [], itemCount: 0 };
  },
};

module.exports = wishlistService;
