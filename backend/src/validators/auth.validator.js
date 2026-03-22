const { z } = require('zod');

// ── Register ─────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),

  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address')
    .max(255),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
      'Password must include uppercase, lowercase, number, and special character'
    ),

  role: z
    .enum(['customer', 'pharmacist'], {
      invalid_type_error: 'Role must be customer or pharmacist',
    })
    .default('customer'),

  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
});

// ── Login ────────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

// ── Refresh Token ────────────────────────────────────────────────────────────
const refreshTokenSchema = z.object({
  refreshToken: z.string({ required_error: 'Refresh token is required' }).min(1),
});

// ── Change Password ──────────────────────────────────────────────────────────
const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: 'Current password is required' })
    .min(1),

  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(8, 'New password must be at least 8 characters')
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
      'New password must include uppercase, lowercase, number, and special character'
    ),
});

// ── Forgot Password (request reset link) ─────────────────────────────────────
const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address'),
});

// ── Reset Password (via token link or OTP code) ──────────────────────────────────
const resetPasswordSchema = z.object({
  token: z.string().min(1).optional(),

  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .optional(),

  code: z
    .string()
    .length(6, 'Code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must be 6 digits')
    .optional(),

  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(8, 'New password must be at least 8 characters')
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
      'New password must include uppercase, lowercase, number, and special character'
    ),
}).refine(
  (data) => data.token || (data.email && data.code),
  { message: 'Either token or email with code is required' }
);

// ── Verify Reset Code ─────────────────────────────────────────────────────
const verifyResetCodeSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address'),

  code: z
    .string({ required_error: 'Code is required' })
    .length(6, 'Code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must be 6 digits'),
});

// ── Google OAuth ─────────────────────────────────────────────────────────────
const googleAuthSchema = z.object({
  idToken: z.string({ required_error: 'Google ID token is required' }).min(1),
});

// ── Apple Sign-In ────────────────────────────────────────────────────────────
const appleAuthSchema = z.object({
  idToken: z.string({ required_error: 'Apple ID token is required' }).min(1),
  authorizationCode: z.string().optional(),
  fullName: z
    .object({
      givenName: z.string().optional(),
      familyName: z.string().optional(),
    })
    .optional(),
});

// ── Update Profile ───────────────────────────────────────────────────────────
const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
});

module.exports = {
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
};
