import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
import { Transaction } from '../models/index.js';

const router = Router();

router.get(
  '/',
  authRequired,
  [query('limit').optional().isInt({ gt: 0, lt: 101 }), query('offset').optional().isInt({ min: 0 }), query('type').optional().isString()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const limit = Number(req.query.limit || 20);
      const offset = Number(req.query.offset || 0);
      const where = { userId: req.user.id };
      if (req.query.type) where.type = req.query.type;

      const { rows, count } = await Transaction.findAndCountAll({ where, limit, offset, order: [['created_at', 'DESC']] });

      return res.json({ success: true, transactions: rows, total: count, limit, offset });
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
