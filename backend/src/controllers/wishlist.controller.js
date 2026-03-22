/**
 * Wishlist Controller — HTTP handlers for /api/wishlist
 */

const wishlistService = require('../services/wishlist.service');
const { success } = require('../utils/response');

const wishlistController = {
  /**
   * GET /api/wishlist
   * Get the authenticated customer's wishlist items.
   */
  async getWishlist(req, res, next) {
    try {
      const wishlist = await wishlistService.getWishlist(req.user.userId);
      return success(res, { wishlist });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/wishlist/ids
   * Get just the medicine IDs in the wishlist (for heart icon state).
   */
  async getWishlistIds(req, res, next) {
    try {
      const ids = await wishlistService.getWishlistIds(req.user.userId);
      return success(res, { ids });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/wishlist/items
   * Body: { medicineId }
   * Add medicine to wishlist.
   */
  async addItem(req, res, next) {
    try {
      const { medicineId } = req.body;
      const wishlist = await wishlistService.addItem(req.user.userId, medicineId);
      return success(res, { wishlist }, 'Added to wishlist');
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/wishlist/toggle
   * Body: { medicineId }
   * Toggle medicine in/out of wishlist.
   */
  async toggleItem(req, res, next) {
    try {
      const { medicineId } = req.body;
      const result = await wishlistService.toggleItem(req.user.userId, medicineId);
      const msg = result.action === 'added' ? 'Added to wishlist' : 'Removed from wishlist';
      return success(res, { wishlist: result }, msg);
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/wishlist/items/:medicineId
   * Remove item from wishlist.
   */
  async removeItem(req, res, next) {
    try {
      const { medicineId } = req.params;
      const wishlist = await wishlistService.removeItem(req.user.userId, medicineId);
      return success(res, { wishlist }, 'Removed from wishlist');
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/wishlist
   * Clear the entire wishlist.
   */
  async clearWishlist(req, res, next) {
    try {
      const wishlist = await wishlistService.clearWishlist(req.user.userId);
      return success(res, { wishlist }, 'Wishlist cleared');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = wishlistController;
