import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import UserModel from './user.js';
import RouteModel from './route.js';
import BusStopModel from './busStop.js';
import TicketModel from './ticket.js';
import TransactionModel from './transaction.js';
import FavoriteModel from './favorite.js';
import SearchHistoryModel from './searchHistory.js';
import VirtualCardModel from './virtualCard.js';
import NfcSessionModel from './nfcSession.js';
import TapPayModel from './tapPayTransaction.js';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

export const sequelize = dbUrl
  ? new Sequelize(dbUrl, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: process.env.PGSSLMODE === 'require' ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    })
  : new Sequelize(
      process.env.PGDATABASE || 'tshwane',
      process.env.PGUSER || 'postgres',
      process.env.PGPASSWORD || '',
      {
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT) || 5432,
        dialect: 'postgres',
        logging: false,
        dialectOptions: process.env.PGSSLMODE === 'require' ? { ssl: { require: true, rejectUnauthorized: false } } : {},
      }
    );

export const User = UserModel(sequelize);
export const Route = RouteModel(sequelize);
export const BusStop = BusStopModel(sequelize);
export const Ticket = TicketModel(sequelize);
export const Transaction = TransactionModel(sequelize);
export const Favorite = FavoriteModel(sequelize);
export const SearchHistory = SearchHistoryModel(sequelize);
export const VirtualCard = VirtualCardModel(sequelize);
export const NfcSession = NfcSessionModel(sequelize);
export const TapPayTransaction = TapPayModel(sequelize);

// Associations
Route.hasMany(BusStop, { foreignKey: 'routeId', as: 'stops' });
BusStop.belongsTo(Route, { foreignKey: 'routeId', as: 'route' });

User.hasMany(Ticket, { foreignKey: 'userId', as: 'tickets' });
Ticket.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Ticket.belongsTo(Route, { foreignKey: 'routeId', as: 'route' });

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(SearchHistory, { foreignKey: 'userId', as: 'searchHistory' });
SearchHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(VirtualCard, { foreignKey: 'userId', as: 'virtualCards' });
VirtualCard.belongsTo(User, { foreignKey: 'userId', as: 'user' });

VirtualCard.hasMany(NfcSession, { foreignKey: 'cardId', as: 'sessions' });
NfcSession.belongsTo(VirtualCard, { foreignKey: 'cardId', as: 'card' });
NfcSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });

VirtualCard.hasMany(TapPayTransaction, { foreignKey: 'cardId', as: 'tapPays' });
TapPayTransaction.belongsTo(VirtualCard, { foreignKey: 'cardId', as: 'card' });
TapPayTransaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
TapPayTransaction.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

export default {
  sequelize,
  User,
  Route,
  BusStop,
  Ticket,
  Transaction,
  Favorite,
  SearchHistory,
};
