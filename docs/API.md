# API Documentation (v1)

Base URL: `http://localhost:3000/api/v1`

Auth
- POST /auth/register
- POST /auth/login
- POST /auth/logout

Users
- GET /users/profile
- PUT /users/profile
- GET /users/balance
- POST /users/recharge

Routes
- GET /routes/search
- GET /routes/:id

Tickets
- POST /tickets/purchase
- GET /tickets

Transactions
- GET /transactions

Favorites
- GET /favorites
- POST /favorites
- DELETE /favorites/:id

Locations
- POST /locations/reverse

Refer to the project brief for request/response schemas.
