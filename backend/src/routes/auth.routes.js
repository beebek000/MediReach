const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const authenticate = require("../middlewares/authenticate");
const validate = require("../middlewares/validate");
const {
  authLimiter,
  passwordResetLimiter,
} = require("../middlewares/rateLimiter");
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyResetCodeSchema,
  googleAuthSchema,
  appleAuthSchema,
  updateProfileSchema,
} = require("../validators/auth.validator");

const router = Router();

// ── Public (rate-limited) ────────────────────────────────────────────────────

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  authController.register,
);

router.post("/login", authLimiter, validate(loginSchema), authController.login);

router.post(
  "/refresh-token",
  authLimiter,
  validate(refreshTokenSchema),
  authController.refreshToken,
);

router.post(
  "/forgot-password",
  passwordResetLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);

router.post(
  "/verify-reset-code",
  passwordResetLimiter,
  validate(verifyResetCodeSchema),
  authController.verifyResetCode,
);

router.post(
  "/reset-password",
  passwordResetLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword,
);
// ── OAuth (rate-limited) ─────────────────────────────────────────────────────

router.post(
  "/google",
  authLimiter,
  validate(googleAuthSchema),
  authController.googleAuth,
);

router.post(
  "/apple",
  authLimiter,
  validate(appleAuthSchema),
  authController.appleAuth,
);
// ── Protected ────────────────────────────────────────────────────────────────

router.post("/logout", authenticate, authController.logout);
router.post("/logout-all", authenticate, authController.logoutAll);

router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);

router.get("/me", authenticate, authController.getProfile);

router.patch(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  authController.updateProfile,
);

module.exports = router;
