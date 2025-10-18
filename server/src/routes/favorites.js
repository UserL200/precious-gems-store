import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
import { Favorite } from '../models/index.js';

const router = Router();

router.get('/', authRequired, async (req, res, next) => {
  try {
    const favorites = await Favorite.findAll({ where: { userId: req.user.id }, order: [['created_at', 'DESC']] });
    return res.json({ success: true, favorites });
  } catch (err) {
    return next(err);
  }
});

router.post(
  '/',
  authRequired,
  [body('from').isString().notEmpty(), body('to').isString().notEmpty(), body('nickname').optional().isString()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
      const { from, to, nickname } = req.body;
      const favorite = await Favorite.create({ userId: req.user.id, fromLocation: from, toLocation: to, nickname });
      return res.status(201).json({ success: true, message: 'Favorite added', favorite });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ success: false, message: 'Favorite already exists' });
      }
      return next(err);
    }
  }
);

router.delete('/:id', authRequired, [param('id').isString().notEmpty()], async (req, res, next) => {
  try {
    const favorite = await Favorite.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!favorite) return res.status(404).json({ success: false, message: 'Favorite not found' });
    await favorite.destroy();
    return res.json({ success: true, message: 'Favorite removed' });
  } catch (err) {
    return next(err);
  }
});

export default router;
