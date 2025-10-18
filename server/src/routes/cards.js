import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import { authRequired } from '../middleware/auth.js';
import { User, VirtualCard, NfcSession } from '../models/index.js';

const router = Router();

function generateCardNumber() {
  // 16-digit virtual number starting with 6011
  const prefix = '6011';
  let middle = '';
  for (let i = 0; i < 11; i++) middle += Math.floor(Math.random() * 10).toString();
  return (prefix + middle).slice(0, 16);
}

router.post(
  '/activate',
  authRequired,
  [body('cardId').optional().isString(), body('pin').optional().isString(), body('duration').optional().isInt({ gt: 0, lt: 8 * 60 })],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { duration = 30 } = req.body; // minutes
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      // Ensure a virtual card exists
      let card = await VirtualCard.findOne({ where: { userId: user.id, status: 'active' } });
      if (!card) {
        card = await VirtualCard.create({
          userId: user.id,
          cardNumber: generateCardNumber(),
          encryptedData: crypto.randomBytes(32).toString('base64'),
          status: 'active',
          activatedAt: new Date(),
          expiresAt: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
        });
      }

      const sessionKey = crypto.randomBytes(32).toString('base64');
      const session = await NfcSession.create({
        cardId: card.id,
        userId: user.id,
        sessionKey,
        status: 'active',
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + Number(duration) * 60 * 1000),
      });

      return res.json({
        success: true,
        message: 'Card activated',
        card: {
          id: card.id,
          status: card.status,
          expiresAt: card.expiresAt,
          balance: Number(user.balance),
          dailyLimit: Number(user.dailyLimit),
          usedToday: Number(user.dailySpent),
        },
        session: { sessionId: session.id, encryptionKey: sessionKey },
      });
    } catch (err) {
      return next(err);
    }
  }
);

router.post('/deactivate', authRequired, async (req, res, next) => {
  try {
    const session = await NfcSession.findOne({ where: { userId: req.user.id, status: 'active' } });
    if (session) {
      await session.update({ status: 'expired', endedAt: new Date() });
    }
    return res.json({ success: true, message: 'Card deactivated' });
  } catch (err) {
    return next(err);
  }
});

router.get('/status', authRequired, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const card = await VirtualCard.findOne({ where: { userId }, order: [['activated_at', 'DESC']] });
    const session = await NfcSession.findOne({ where: { userId, status: 'active' } });

    return res.json({
      success: true,
      card: card
        ? {
            id: card.id,
            status: card.status,
            balance: Number((await User.findByPk(userId)).balance),
            isNFCEnabled: card.isNfcEnabled,
            dailyLimit: Number((await User.findByPk(userId)).dailyLimit),
            usedToday: Number((await User.findByPk(userId)).dailySpent),
            remainingToday:
              Number((await User.findByPk(userId)).dailyLimit) - Number((await User.findByPk(userId)).dailySpent),
            lastTransaction: null,
          }
        : null,
      session: session ? { id: session.id, expiresAt: session.expiresAt } : null,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
