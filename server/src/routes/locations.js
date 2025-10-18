import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.post(
  '/reverse',
  authRequired,
  [body('latitude').isFloat({ min: -90, max: 90 }), body('longitude').isFloat({ min: -180, max: 180 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    // Placeholder reverse geocode for local dev (no external API)
    const { latitude, longitude } = req.body;
    return res.json({
      success: true,
      address: 'Hatfield, Pretoria',
      city: 'Pretoria',
      province: 'Gauteng',
      country: 'South Africa',
      formattedAddress: 'Hatfield, Pretoria, Gauteng',
      coordinates: { latitude, longitude },
    });
  }
);

export default router;
