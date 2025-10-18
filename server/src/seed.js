import dotenv from 'dotenv';
import { sequelize, User, Route, BusStop } from './models/index.js';
import { hashPassword } from './utils/password.js';

dotenv.config();

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    const usersSeed = [
      { name: 'John Doe', email: 'john@tshwane.com', password: 'test1234', phone: '+27812345678', balance: 100.0, cardNumber: '1234 5678 9012 3456' },
      { name: 'Jane Smith', email: 'jane@tshwane.com', password: 'test1234', phone: '+27823456789', balance: 50.0, cardNumber: '2345 6789 0123 4567' },
      { name: 'Mike Johnson', email: 'mike@tshwane.com', password: 'test1234', phone: '+27834567890', balance: 200.0, cardNumber: '3456 7890 1234 5678' },
    ];

    const users = [];
    for (const u of usersSeed) {
      const hashed = await hashPassword(u.password);
      const created = await User.create({ ...u, password: hashed });
      users.push(created);
    }

    const routesSeed = [
      {
        busNumber: '201',
        name: 'Hatfield to Centurion Express',
        fromLocation: 'Hatfield',
        toLocation: 'Centurion',
        departureTime: '14:30',
        arrivalTime: '15:12',
        duration: 42,
        distance: 18.5,
        price: 12.0,
        transfers: 0,
        stops: [
          { order: 1, name: 'Hatfield Station', time: '14:30', platform: 'Platform 3', lat: -25.7479, lon: 28.2293 },
          { order: 2, name: 'Hillcrest', time: '14:35', platform: null, lat: -25.755, lon: 28.235 },
          { order: 3, name: 'Lynnwood', time: '14:42', platform: null, lat: -25.765, lon: 28.245 },
          { order: 4, name: 'Menlyn Mall', time: '14:50', platform: 'Stop 2', lat: -25.785, lon: 28.275 },
          { order: 5, name: 'Waterkloof', time: '15:00', platform: null, lat: -25.8, lon: 28.285 },
          { order: 6, name: 'Centurion Mall', time: '15:12', platform: 'Platform 5', lat: -25.8601, lon: 28.1894 },
        ],
      },
      {
        busNumber: '103',
        name: 'Lotus Gardens to CBD',
        fromLocation: 'Lotus Gardens',
        toLocation: 'Pretoria CBD',
        departureTime: '07:30',
        arrivalTime: '08:12',
        duration: 42,
        distance: 12.3,
        price: 12.0,
        transfers: 0,
        stops: [
          { order: 1, name: 'Lotus Gardens Terminal', time: '07:30', platform: 'Bay 1', lat: -25.7863, lon: 28.2358 },
          { order: 2, name: 'Atteridgeville', time: '07:40', platform: null, lat: -25.775, lon: 28.185 },
          { order: 3, name: 'Mamelodi West', time: '07:50', platform: null, lat: -25.765, lon: 28.175 },
          { order: 4, name: 'Church Square', time: '08:05', platform: 'Stop 3', lat: -25.7461, lon: 28.1881 },
          { order: 5, name: 'Pretoria CBD Terminal', time: '08:12', platform: 'Platform 2', lat: -25.7479, lon: 28.1889 },
        ],
      },
      {
        busNumber: '305',
        name: 'Menlyn to Arcadia Link',
        fromLocation: 'Menlyn',
        toLocation: 'Arcadia',
        departureTime: '09:00',
        arrivalTime: '09:25',
        duration: 25,
        distance: 8.5,
        price: 15.0,
        transfers: 0,
        stops: [
          { order: 1, name: 'Menlyn Shopping Centre', time: '09:00', platform: 'Stop 1', lat: -25.785, lon: 28.275 },
          { order: 2, name: 'Brooklyn', time: '09:08', platform: null, lat: -25.765, lon: 28.235 },
          { order: 3, name: 'University of Pretoria', time: '09:15', platform: 'Main Gate', lat: -25.7545, lon: 28.2314 },
          { order: 4, name: 'Arcadia Station', time: '09:25', platform: 'Platform 4', lat: -25.7463, lon: 28.2042 },
        ],
      },
      {
        busNumber: '420',
        name: 'Sunnyside to Centurion',
        fromLocation: 'Sunnyside',
        toLocation: 'Centurion Mall',
        departureTime: '16:00',
        arrivalTime: '17:15',
        duration: 75,
        distance: 22.0,
        price: 20.0,
        transfers: 0,
        stops: [
          { order: 1, name: 'Sunnyside Station', time: '16:00', platform: 'Platform 1', lat: -25.7543, lon: 28.2011 },
          { order: 2, name: 'Pretoria Central', time: '16:10', platform: null, lat: -25.7461, lon: 28.1881 },
          { order: 3, name: 'Capital Park', time: '16:25', platform: null, lat: -25.775, lon: 28.215 },
          { order: 4, name: 'Wonderboom', time: '16:45', platform: 'Stop 2', lat: -25.805, lon: 28.225 },
          { order: 5, name: 'Centurion Mall', time: '17:15', platform: 'Platform 3', lat: -25.8601, lon: 28.1894 },
        ],
      },
      {
        busNumber: '150',
        name: 'Brooklyn Hatfield Shuttle',
        fromLocation: 'Brooklyn',
        toLocation: 'Hatfield',
        departureTime: '08:30',
        arrivalTime: '08:45',
        duration: 15,
        distance: 3.5,
        price: 8.0,
        transfers: 0,
        stops: [
          { order: 1, name: 'Brooklyn Mall', time: '08:30', platform: 'Bay 2', lat: -25.765, lon: 28.235 },
          { order: 2, name: 'Groenkloof', time: '08:37', platform: null, lat: -25.76, lon: 28.23 },
          { order: 3, name: 'Hatfield Plaza', time: '08:45', platform: 'Platform 1', lat: -25.7479, lon: 28.2293 },
        ],
      },
    ];

    for (const r of routesSeed) {
      const created = await Route.create({
        busNumber: r.busNumber,
        name: r.name,
        fromLocation: r.fromLocation,
        toLocation: r.toLocation,
        departureTime: r.departureTime,
        arrivalTime: r.arrivalTime,
        duration: r.duration,
        distance: r.distance,
        price: r.price,
        transfers: r.transfers,
      });
      for (const s of r.stops) {
        await BusStop.create({
          routeId: created.id,
          stopOrder: s.order,
          name: s.name,
          arrivalTime: s.time,
          platform: s.platform,
          latitude: s.lat,
          longitude: s.lon,
        });
      }
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
