import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
import { Route, BusStop } from '../models/index.js';

const router = Router();

router.get(
  '/search',
  authRequired,
  [query('from').isString().notEmpty(), query('to').isString().notEmpty(), query('time').optional().isString(), query('date').optional().isString()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { from, to } = req.query;
      const candidates = await Route.findAll({
        where: { fromLocation: from, toLocation: to, isActive: true },
        include: [{ model: BusStop, as: 'stops', separate: true, order: [['stop_order', 'ASC']] }],
        order: [['departureTime', 'ASC']],
      });
      if (!candidates || candidates.length === 0) return res.status(404).json({ success: false, message: 'No routes found' });

      const routes = candidates.map((r) => ({
        id: r.id,
        busNumber: r.busNumber,
        from: r.fromLocation,
        to: r.toLocation,
        departure: r.departureTime,
        arrival: r.arrivalTime,
        duration: r.duration,
        transfers: r.transfers,
        price: Number(r.price),
        stops: r.stops.map((s) => ({ id: s.id, name: s.name, time: s.arrivalTime, platform: s.platform })),
      }));

      return res.json({ success: true, routes });
    } catch (err) {
      return next(err);
    }
  }
);

router.get('/:id', authRequired, async (req, res, next) => {
  try {
    const route = await Route.findByPk(req.params.id, {
      include: [{ model: BusStop, as: 'stops', separate: true, order: [['stop_order', 'ASC']] }],
    });
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    const payload = {
      id: route.id,
      busNumber: route.busNumber,
      from: route.fromLocation,
      to: route.toLocation,
      departure: route.departureTime,
      arrival: route.arrivalTime,
      duration: route.duration,
      price: Number(route.price),
      stops: route.stops.map((s) => ({ id: s.id, name: s.name, time: s.arrivalTime, platform: s.platform })),
    };
    return res.json({ success: true, route: payload });
  } catch (err) {
    return next(err);
  }
});

export default router;
