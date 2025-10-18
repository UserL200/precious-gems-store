import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { sequelize, User } from '../models/index.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').isString().isLength({ min: 2 }),
    body('email').isEmail(),
    body('password').isString().isLength({ min: 6 }),
    body('phone').optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { name, email, password, phone } = req.body;
      const exists = await User.scope('withPassword').findOne({ where: { email } });
      if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
      const hashed = await hashPassword(password);
      const user = await User.create({ name, email, password: hashed, phone, balance: 50.0 });
      return res.status(201).json({ success: true, message: 'Registration successful', userId: user.id });
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').isString().isLength({ min: 4 })],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { email, password } = req.body;
      const user = await User.scope('withPassword').findOne({ where: { email } });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      const ok = await comparePassword(password, user.password);
      if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const { token, expiresIn } = signAccessToken(user);
      const refreshToken = signRefreshToken(user);

      await user.update({ lastLogin: new Date() });

      return res.json({
        success: true,
        token,
        refreshToken,
        user: { id: user.id, name: user.name, email: user.email, balance: Number(user.balance) },
        expiresIn,
      });
    } catch (err) {
      return next(err);
    }
  }
);

router.post('/logout', async (_req, res) => {
  // For now, stateless JWT; clients should discard tokens.
  return res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
