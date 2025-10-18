import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
import { User } from '../models/index.js';

const router = Router();

router.get('/profile', authRequired, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const cardMasked = user.cardNumber ? `**** **** **** ${user.cardNumber.replace(/\s+/g, '').slice(-4)}` : null;
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      balance: Number(user.balance),
      cardNumber: cardMasked,
      createdAt: user.createdAt,
    };
    return res.json({ success: true, user: payload });
  } catch (err) {
    return next(err);
  }
});

router.put(
  '/profile',
  authRequired,
  [body('name').optional().isString().isLength({ min: 2 }), body('phone').optional().isString()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      const { name, phone } = req.body;
      await user.update({ name: name ?? user.name, phone: phone ?? user.phone });
      return res.json({ success: true, message: 'Profile updated', user });
    } catch (err) {
      return next(err);
    }
  }
);

router.get('/balance', authRequired, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    return res.json({ success: true, balance: Number(user.balance), currency: 'ZAR' });
  } catch (err) {
    return next(err);
  }
});

router.post(
  '/recharge',
  authRequired,
  [body('amount').isFloat({ gt: 0 }), body('paymentMethod').isString()],
  async (req, res, next) => {
    const t = await User.sequelize.transaction();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await t.rollback();
        return res.status(400).json({ success: false, errors: errors.array() });
      }
      const { amount } = req.body;
      const user = await User.findByPk(req.user.id, { transaction: t, lock: t.LOCK.UPDATE });
      const balanceBefore = Number(user.balance);
      const balanceAfter = balanceBefore + Number(amount);
      await user.update({ balance: balanceAfter }, { transaction: t });
      const { Transaction } = await import('../models/index.js');
      const txn = await Transaction.create(
        {
          userId: user.id,
          type: 'recharge',
          amount: Number(amount),
          balanceBefore,
          balanceAfter,
          status: 'completed',
          description: 'Balance Recharge',
        },
        { transaction: t }
      );
      await t.commit();
      return res.json({ success: true, message: 'Recharge successful', newBalance: balanceAfter, transactionId: txn.id });
    } catch (err) {
      await t.rollback();
      return next(err);
    }
  }
);

export default router;
