const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const appleSignin = require('apple-signin-auth');
const config = require('../config');
const userRepository = require('../repositories/user.repository');
const tokenRepository = require('../repositories/token.repository');
const resetTokenRepository = require('../repositories/resetToken.repository');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetToken,
  verifyResetToken,
  parseDuration,
} = require('../utils/jwt');
const {
  sendPasswordResetEmail,
  sendPasswordResetCode,
  sendWelcomeEmail,
  sendProfileUpdateEmail,
  sendPasswordChangedEmail,
} = require('../utils/email');
const {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} = require('../utils/errors');

const SALT_ROUNDS = 12;
const googleClient = new OAuth2Client(config.google.clientId);

/**
 * Auth Service — all business logic for authentication & authorization.
 */

const authService = {
  // ──────────────────────────────────────────────────────────────── REGISTER
  async register({ name, email, password, role, phone, address }) {
    // Check uniqueness
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
    });

    // Send welcome email (fire and forget)
    sendWelcomeEmail(user.email, user.name).catch(console.error);

    return user;
  },

  // ──────────────────────────────────────────────────────────────── LOGIN
  async login({ email, password, ipAddress, userAgent }) {
    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check blocked
    if (user.status === 'blocked') {
      throw new ForbiddenError('Your account has been blocked. Contact support.');
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshTokenJwt = generateRefreshToken({ userId: user.id });

    // Persist refresh token
    const expiresAt = new Date(
      Date.now() + parseDuration(config.jwt.refreshExpiresIn)
    );
    await tokenRepository.create({
      userId: user.id,
      token: refreshTokenJwt,
      expiresAt,
      ipAddress,
      userAgent,
    });

    // Strip password from response
    const { password: _, ...safeUser } = user;

    return { user: safeUser, accessToken, refreshToken: refreshTokenJwt };
  },

  // ──────────────────────────────────────────────────────────── REFRESH TOKEN
  async refreshToken({ refreshToken, ipAddress, userAgent }) {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    // Verify JWT signature & expiry
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Look up stored token
    const storedToken = await tokenRepository.findByToken(refreshToken);
    if (!storedToken) {
      throw new UnauthorizedError('Refresh token not found');
    }

    // If token has already been revoked → potential reuse attack
    // Revoke the entire family for safety
    if (storedToken.revoked) {
      await tokenRepository.revokeAllForUser(storedToken.user_id);
      throw new UnauthorizedError('Refresh token reuse detected — all sessions revoked');
    }

    // Check expiry in DB as well
    if (new Date(storedToken.expires_at) < new Date()) {
      throw new UnauthorizedError('Refresh token expired');
    }

    // Get user
    const user = await userRepository.findById(decoded.userId);
    if (!user || user.status === 'blocked') {
      await tokenRepository.revokeAllForUser(storedToken.user_id);
      throw new ForbiddenError('Account unavailable');
    }

    // ── Token rotation: issue new pair, revoke old ──
    const newAccessToken = generateAccessToken({ userId: user.id, role: user.role });
    const newRefreshTokenJwt = generateRefreshToken({ userId: user.id });

    const expiresAt = new Date(
      Date.now() + parseDuration(config.jwt.refreshExpiresIn)
    );
    const newRow = await tokenRepository.create({
      userId: user.id,
      token: newRefreshTokenJwt,
      expiresAt,
      ipAddress,
      userAgent,
    });

    // Revoke old token and link to new one
    await tokenRepository.revoke(storedToken.id, newRow.id);

    return { accessToken: newAccessToken, refreshToken: newRefreshTokenJwt };
  },

  // ──────────────────────────────────────────────────────────────── LOGOUT
  async logout(refreshToken) {
    if (!refreshToken) return;

    const storedToken = await tokenRepository.findByToken(refreshToken);
    if (storedToken && !storedToken.revoked) {
      await tokenRepository.revoke(storedToken.id);
    }
  },

  // ────────────────────────────────────────────────────── LOGOUT ALL DEVICES
  async logoutAll(userId) {
    await tokenRepository.revokeAllForUser(userId);
  },

  // ─────────────────────────────────────────────────────── CHANGE PASSWORD
  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw new NotFoundError('User not found');

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) throw new BadRequestError('Current password is incorrect');

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.updatePassword(userId, hashed);

    // Send confirmation email
    console.log(`Sending password change email to ${user.email} (${user.name})`);
    sendPasswordChangedEmail(user.email, user.name)
      .then(() => console.log('Password change email sent successfully'))
      .catch(err => console.error('Failed to send password change email:', err));

    // Revoke all refresh tokens so user must re-login
    await tokenRepository.revokeAllForUser(userId);
  },

  // ─────────────────────────────────────────────────── FORGOT PASSWORD
  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);

    // Always respond with success to prevent email enumeration
    if (!user) return;

    // Generate a 6-digit OTP code
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // Also generate a reset JWT (kept for internal tracking)
    const resetJwt = generateResetToken({ userId: user.id });

    const expiresAt = new Date(
      Date.now() + parseDuration(config.passwordReset.expiresIn)
    );

    await resetTokenRepository.create({
      userId: user.id,
      token: resetJwt,
      code,
      expiresAt,
    });

    // Send OTP code via email
    await sendPasswordResetCode(user.email, code);
  },

  // ────────────────────────────────────────── VERIFY RESET CODE
  async verifyResetCode({ email, code }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestError('Invalid email or code');
    }

    const record = await resetTokenRepository.findValidCode(user.id, code);
    if (!record) {
      throw new BadRequestError('Invalid or expired reset code');
    }

    return { valid: true };
  },

  // ─────────────────────────────────────────────────── RESET PASSWORD
  async resetPassword({ email, code, token, newPassword }) {
    let userId;
    let record;

    if (email && code) {
      // ── Code-based reset (OTP flow) ──
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new BadRequestError('Invalid email or code');
      }

      record = await resetTokenRepository.findValidCode(user.id, code);
      if (!record) {
        throw new BadRequestError('Invalid or expired reset code');
      }
      userId = user.id;
    } else if (token) {
      // ── Token-based reset (link flow — backward compatible) ──
      let decoded;
      try {
        decoded = verifyResetToken(token);
      } catch {
        throw new BadRequestError('Invalid or expired reset token');
      }

      record = await resetTokenRepository.findValidToken(token);
      if (!record) {
        throw new BadRequestError('Reset token is invalid or has already been used');
      }
      userId = decoded.userId;
    } else {
      throw new BadRequestError('Email with code or reset token is required');
    }

    // Hash & update
    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.updatePassword(userId, hashed);

    // Mark token as used
    await resetTokenRepository.markUsed(record.id);

    // Fetch user for email
    const user = await userRepository.findById(userId);
    if (user) {
      console.log(`Sending password reset confirmation email to ${user.email} (${user.name})`);
      sendPasswordChangedEmail(user.email, user.name)
        .then(() => console.log('Password reset confirmation email sent successfully'))
        .catch(err => console.error('Failed to send password reset confirmation email:', err));
    }

    // Revoke all refresh tokens so user must re-login
    await tokenRepository.revokeAllForUser(userId);
  },

  // ─────────────────────────────────────────────────── GOOGLE OAUTH 2.0
  async googleAuth({ idToken, ipAddress, userAgent }) {
    if (!idToken) {
      throw new BadRequestError('Google ID token is required');
    }

    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken,
        audience: config.google.clientId,
      });
    } catch {
      throw new UnauthorizedError('Invalid or expired Google token');
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new UnauthorizedError('Google token did not contain email');
    }

    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    const { user } = await userRepository.findOrCreateOAuth({
      email,
      name: name || email.split('@')[0],
      authProvider: 'google',
      providerId: googleId,
      avatarUrl: picture || null,
    });

    if (user.status === 'blocked') {
      throw new ForbiddenError('Your account has been blocked. Contact support.');
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshTokenJwt = generateRefreshToken({ userId: user.id });

    const expiresAt = new Date(
      Date.now() + parseDuration(config.jwt.refreshExpiresIn)
    );
    await tokenRepository.create({
      userId: user.id,
      token: refreshTokenJwt,
      expiresAt,
      ipAddress,
      userAgent,
    });

    return { user, accessToken, refreshToken: refreshTokenJwt };
  },

  // ─────────────────────────────────────────────────── APPLE SIGN-IN
  async appleAuth({ idToken, authorizationCode, fullName, ipAddress, userAgent }) {
    if (!idToken) {
      throw new BadRequestError('Apple ID token is required');
    }

    let applePayload;
    try {
      applePayload = await appleSignin.verifyIdToken(idToken, {
        audience: config.apple.clientId,
        ignoreExpiration: false,
      });
    } catch {
      throw new UnauthorizedError('Invalid or expired Apple token');
    }

    if (!applePayload || !applePayload.email) {
      throw new UnauthorizedError('Apple token did not contain email');
    }

    const { sub: appleId, email } = applePayload;

    // Apple only sends name on first sign-in
    const userName = fullName
      ? [fullName.givenName, fullName.familyName].filter(Boolean).join(' ') || email.split('@')[0]
      : email.split('@')[0];

    // Find or create user
    const { user } = await userRepository.findOrCreateOAuth({
      email,
      name: userName,
      authProvider: 'apple',
      providerId: appleId,
      avatarUrl: null,
    });

    if (user.status === 'blocked') {
      throw new ForbiddenError('Your account has been blocked. Contact support.');
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshTokenJwt = generateRefreshToken({ userId: user.id });

    const expiresAt = new Date(
      Date.now() + parseDuration(config.jwt.refreshExpiresIn)
    );
    await tokenRepository.create({
      userId: user.id,
      token: refreshTokenJwt,
      expiresAt,
      ipAddress,
      userAgent,
    });

    return { user, accessToken, refreshToken: refreshTokenJwt };
  },

  // ─────────────────────────────────────────────────── GET PROFILE
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  },

  // ──────────────────────────────────────────────────────────────── UPDATE PROFILE
  async updateProfile(userId, data) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const updated = await userRepository.updateProfile(userId, data);
    
    // Send confirmation email
    sendProfileUpdateEmail(updated.email, updated.name).catch(console.error);

    return updated;
  },
};

module.exports = authService;
