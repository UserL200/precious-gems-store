import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import { authRequired } from '../middleware/auth.js';
import { User, VirtualCard, NfcSession, TapPayTransaction, Transaction } from '../models/index.js';

const router = Router();

const usedNonces = new Map();
function cleanupNonces() {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  for (const [nonce, ts] of usedNonces.entries()) if (ts < fiveMinutesAgo) usedNonces.delete(nonce);
}

router.post(
  '/tap-pay',
  authRequired,
  [
    body('cardId').isString().notEmpty(),
    body('amount').isFloat({ gt: 0 }),
    body('timestamp').isInt(),
    body('nonce').isString().notEmpty(),
    body('readerId').isString().notEmpty(),
    body('busNumber').optional().isString(),
    body('routeId').optional().isString(),
    body('location').optional().isObject(),
  ],
  async (req, res, next) => {
    const t = await TapPayTransaction.sequelize.transaction();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await t.rollback();
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const signature = req.headers['x-nfc-signature'];
      if (!signature) {
        await t.rollback();
        return res.status(401).json({ success: false, message: 'Missing signature' });
      }

      const { cardId, amount, timestamp, nonce, readerId, routeId, busNumber, location } = req.body;

      // Replay protection
      cleanupNonces();
      if (usedNonces.has(nonce)) {
        await t.rollback();
        return res.status(409).json({ success: false, message: 'Duplicate transaction detected' });
      }
      if (Math.abs(Date.now() - Number(timestamp)) > 2 * 60 * 1000) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Transaction expired' });
      }

      // Validate session and card
      const card = await VirtualCard.findByPk(cardId);
      if (!card || card.status !== 'active') {
        await t.rollback();
        return res.status(403).json({ success: false, message: 'Card not activated' });
      }
      const session = await NfcSession.findOne({ where: { cardId, userId: req.user.id, status: 'active' } });
      if (!session || session.expiresAt < new Date()) {
        await t.rollback();
        return res.status(403).json({ success: false, message: 'Session expired' });
      }

      // Verify signature (HMAC with sessionKey)
      const data = JSON.stringify({ cardId, amount, timestamp, nonce, readerId, routeId, busNumber, location });
      const expected = crypto.createHmac('sha256', session.sessionKey).update(data).digest('hex');
      const ok = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
      if (!ok) {
        await t.rollback();
        return res.status(401).json({ success: false, message: 'Invalid signature' });
      }

      const user = await User.findByPk(req.user.id, { transaction: t, lock: t.LOCK.UPDATE });

      // Reset daily spent at day boundary
      const today = new Date().toISOString().slice(0, 10);
      if (String(user.lastResetDate) !== today) {
        await user.update({ dailySpent: 0, lastResetDate: today }, { transaction: t });
      }

      const newDailySpent = Number(user.dailySpent) + Number(amount);
      if (newDailySpent > Number(user.dailyLimit)) {
        await t.rollback();
        return res.status(429).json({ success: false, message: 'Daily limit exceeded' });
      }

      if (Number(user.balance) < Number(amount)) {
        await t.rollback();
        return res.status(402).json({ success: false, message: 'Insufficient balance' });
      }

      const balanceBefore = Number(user.balance);
      const balanceAfter = balanceBefore - Number(amount);
      await user.update({ balance: balanceAfter, dailySpent: newDailySpent }, { transaction: t });

      const txn = await Transaction.create(
        {
          userId: user.id,
          type: 'purchase',
          amount: -Number(amount),
          balanceBefore,
          balanceAfter,
          status: 'completed',
          description: busNumber ? `Tap Pay - Bus #${busNumber}` : 'Tap Pay',
          referenceId: readerId,
        },
        { transaction: t }
      );

      const tap = await TapPayTransaction.create(
        {
          userId: user.id,
          cardId: card.id,
          transactionId: txn.id,
          readerId,
          busNumber,
          routeId,
          amount: Number(amount),
          nonce,
          signature,
          locationLat: location?.latitude,
          locationLon: location?.longitude,
          status: 'completed',
        },
        { transaction: t }
      );

      usedNonces.set(nonce, Date.now());

      await t.commit();

      return res.json({
        success: true,
        message: 'Payment successful',
        transaction: {
          id: txn.id,
          type: 'tap_pay',
          amount: -Number(amount),
          balance: balanceAfter,
          route: undefined,
          busNumber,
          timestamp: txn.createdAt,
          receipt: { id: tap.id, qrCode: null },
        },
      });
    } catch (err) {
      await t.rollback();
      return next(err);
    }
  }
);

export default router;
