import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
import { User, Ticket, Route } from '../models/index.js';
import QRCode from 'qrcode';

const router = Router();

router.post(
  '/purchase',
  authRequired,
  [body('routeId').isString().notEmpty(), body('price').isFloat({ gt: 0 })],
  async (req, res, next) => {
    const t = await Ticket.sequelize.transaction();
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await t.rollback();
        return res.status(400).json({ success: false, errors: errors.array() });
      }
      const { routeId, price } = req.body;
      const route = await Route.findByPk(routeId);
      if (!route) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Invalid route' });
      }

      const user = await User.findByPk(req.user.id, { transaction: t, lock: t.LOCK.UPDATE });
      const currentBalance = Number(user.balance);
      if (currentBalance < Number(price)) {
        await t.rollback();
        return res.status(402).json({ success: false, message: 'Insufficient balance' });
      }

      const balanceAfter = currentBalance - Number(price);
      await user.update({ balance: balanceAfter }, { transaction: t });

      const validFrom = new Date();
      const validUntil = new Date(validFrom.getTime() + 24 * 60 * 60 * 1000);
      const qrPayload = { userId: user.id, routeId: route.id, validUntil: validUntil.toISOString() };
      const qrCode = await QRCode.toDataURL(JSON.stringify(qrPayload));

      const ticket = await Ticket.create(
        {
          userId: user.id,
          routeId: route.id,
          busNumber: route.busNumber,
          fromLocation: route.fromLocation,
          toLocation: route.toLocation,
          price: Number(price),
          qrCode,
          status: 'active',
          validFrom,
          validUntil,
        },
        { transaction: t }
      );

      const { Transaction } = await import('../models/index.js');
      await Transaction.create(
        {
          userId: user.id,
          type: 'purchase',
          amount: -Number(price),
          balanceBefore: currentBalance,
          balanceAfter,
          status: 'completed',
          description: `Ticket Purchase - Bus #${route.busNumber}`,
          referenceId: ticket.id,
        },
        { transaction: t }
      );

      await t.commit();

      return res.status(201).json({
        success: true,
        message: 'Ticket purchased successfully',
        ticket: {
          id: ticket.id,
          routeId: ticket.routeId,
          busNumber: ticket.busNumber,
          from: ticket.fromLocation,
          to: ticket.toLocation,
          price: Number(ticket.price),
          qrCode: ticket.qrCode,
          status: ticket.status,
          validFrom: ticket.validFrom,
          validUntil: ticket.validUntil,
          createdAt: ticket.createdAt,
        },
        newBalance: balanceAfter,
      });
    } catch (err) {
      await t.rollback();
      return next(err);
    }
  }
);

router.get('/', authRequired, [query('status').optional().isString()], async (req, res, next) => {
  try {
    const where = { userId: req.user.id };
    if (req.query.status) where.status = req.query.status;
    const tickets = await Ticket.findAll({ where, order: [['created_at', 'DESC']] });
    return res.json({ success: true, tickets });
  } catch (err) {
    return next(err);
  }
});

export default router;
