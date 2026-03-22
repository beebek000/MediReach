const authService = require('../services/auth.service');
const { success, created } = require('../utils/response');

/**
 * Auth Controller — HTTP layer; delegates to authService.
 */

const authController = {
  // ──────────────────────────────────────── POST /api/auth/register
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      return created(res, { user }, 'Registration successful');
    } catch (err) {
      next(err);
    }
  },

  // ──────────────────────────────────────── POST /api/auth/login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const ipAddress =
        req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'] || '';

      const result = await authService.login({ email, password, ipAddress, userAgent });

      return success(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  },

  // ──────────────────────────────────────── POST /api/auth/refresh-token
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const ipAddress =
        req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'] || '';

      const tokens = await authService.refreshToken({
        refreshToken,
        ipAddress,
        userAgent,
      });

      return success(res, tokens, 'Token refreshed');
    } catch (err) {
      next(err);
    }
  },

  // ──────────────────────────────────────── POST /api/auth/logout
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      return success(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  },

  // ──────────────────────────────────────── POST /api/auth/logout-all
  async logoutAll(req, res, next) {
    try {
      await authService.logoutAll(req.user.userId);
      return success(res, null, 'Logged out from all devices');
    } catch (err) {
      next(err);
    }
  },

  // ──────────────────────────────────────── POST /api/auth/change-password
  async changePassword(req, res, next) {
    try {
      await authService.changePassword(req.user.userId, req.body);
      return success(res, null, 'Password changed successfully. Please login again.');
    } catch (err) {
      next(err);
    }
  },

  // ──────────────────────────────────────── POST /api/auth/forgot-password
  async forgotPassword(req, res, next) {
    try {
      await authService.forgotPassword(req.body.email);
      // Always return success to prevent email enumeration
      return success(
        res,
        null,
        'If an account with that email exists, a reset code has been sent'
      );
    } catch (err) {
      next(err);
    }
  },

  // ──────────────────────────────────────── POST /api/auth/verify-reset-code
  async verifyResetCode(req, res, next) {
    try {
      const result = await authService.verifyResetCode(req.body);
      return success(res, result, 'Code verified successfully');
    } catch (err) {
      next(err);
    }
  },

  // ──────────────────────────────────────── POST /api/auth/reset-password
  async resetPassword(req, res, next) {
    try {
      await authService.resetPassword(req.body);
      return success(res, null, 'Password reset successful. Please login with your new password.');
    } catch (err) {
      next(err);
    }
  },

  // ──────────────────────────────────────── GET /api/auth/me
  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.userId);
      return success(res, { user }, 'Profile retrieved');
    } catch (err) {
      next(err);
    }
  },

  // ──────────────────────────────────────── POST /api/auth/google
  async googleAuth(req, res, next) {
    try {
      const { idToken } = req.body;
      const ipAddress =
        req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'] || '';

      const result = await authService.googleAuth({ idToken, ipAddress, userAgent });

      return success(res, result, 'Google authentication successful');
    } catch (err) {
      next(err);
    }
  },

  // ──────────────────────────────────────── POST /api/auth/apple
  async appleAuth(req, res, next) {
    try {
      const { idToken, authorizationCode, fullName } = req.body;
      const ipAddress =
        req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'] || '';

      const result = await authService.appleAuth({
        idToken,
        authorizationCode,
        fullName,
        ipAddress,
        userAgent,
      });

      return success(res, result, 'Apple authentication successful');
    } catch (err) {
      next(err);
    }
  },
  // ──────────────────────────────────────── PATCH /api/auth/profile
  async updateProfile(req, res, next) {
    try {
      const user = await authService.updateProfile(req.user.userId, req.body);
      return success(res, { user }, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
