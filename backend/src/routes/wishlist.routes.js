/**
 * Wishlist Routes — /api/wishlist
 *
 * GET    /                       — get wishlist items
 * GET    /ids                    — get medicine IDs in wishlist
 * POST   /items                  — add item to wishlist
 * POST   /toggle                 — toggle item in/out of wishlist
 * DELETE /items/:medicineId      — remove item from wishlist
 * DELETE /                       — clear wishlist
 */

const { Router } = require('express');
const wishlistController = require('../controllers/wishlist.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { wishlistItemSchema } = require('../validators/wishlist.validator');

const router = Router();

// All wishlist routes require authentication + customer role
router.use(authenticate, authorize('customer'));

router.get('/', wishlistController.getWishlist);
router.get('/ids', wishlistController.getWishlistIds);
router.post('/items', validate(wishlistItemSchema), wishlistController.addItem);
router.post('/toggle', validate(wishlistItemSchema), wishlistController.toggleItem);
router.delete('/items/:medicineId', wishlistController.removeItem);
router.delete('/', wishlistController.clearWishlist);

module.exports = router;
