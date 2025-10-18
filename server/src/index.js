import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { sequelize } from './models/index.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import routesRoutes from './routes/routes.js';
import ticketsRoutes from './routes/tickets.js';
import transactionsRoutes from './routes/transactions.js';
import favoritesRoutes from './routes/favorites.js';
import locationsRoutes from './routes/locations.js';
import cardsRoutes from './routes/cards.js';
import tapPayRoutes from './routes/tapPay.js';

dotenv.config();

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(limiter);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/routes', routesRoutes);
app.use('/api/v1/tickets', ticketsRoutes);
app.use('/api/v1/transactions', transactionsRoutes);
app.use('/api/v1/favorites', favoritesRoutes);
app.use('/api/v1/locations', locationsRoutes);
app.use('/api/v1/cards', cardsRoutes);
app.use('/api/v1/transactions', tapPayRoutes);

// Generic error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    const server = app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
    const { createBusTrackingServer } = await import('./ws/busTracking.js');
    createBusTrackingServer(server);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
