# Setup

## Prerequisites
- Node.js 18+
- Yarn or npm
- PostgreSQL 14+

## Backend
1. Copy server environment:
   ```bash
   cp server/.env.example server/.env
   ```
2. Update Postgres credentials in `server/.env`.
3. Install dependencies and seed database:
   ```bash
   cd server
   npm install
   npm run seed
   npm run start
   ```
4. Health check: `GET http://localhost:3000/health`

## Mobile (Expo)
1. Install dependencies:
   ```bash
   cd ../mobile
   npm install
   npm start
   ```
2. Ensure the backend is running on your machine and the device can reach `http://localhost:3000`.
   - For Android emulator use `http://10.0.2.2:3000`
   - For iOS simulator use `http://localhost:3000`
   - Update `src/utils/api.ts` baseURL accordingly if needed.

## Test Credentials
- Email: `john@tshwane.com`
- Password: `test1234`
- Starting balance: `R100.00`
