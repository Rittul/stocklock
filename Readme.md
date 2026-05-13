# StockLock

> A real-time inventory reservation system that prevents overselling during high-traffic scenarios using PostgreSQL row-level locking, Redis, and BullMQ.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express.js, Prisma ORM |
| **Database** | PostgreSQL |
| **Queue** | Redis + BullMQ |
| **Frontend** | React + Vite |
| **Deployment** | Railway (backend), Netlify (frontend), Upstash (Redis) |
| **DevOps** | Docker, Docker Compose |

---

## Architecture

```
Frontend (React + Vite)
         │
         ▼
Backend API (Express + Prisma)
         │
    ┌────┴────┐
    ▼         ▼
PostgreSQL   Redis + BullMQ
(Database)   (Expiry Queue)
```

---

## Database Schema (3NF)

The schema is normalized to Third Normal Form. Five tables cover the full reservation lifecycle:

- **User** — customer identity
- **Product** — item catalog
- **Warehouse** — physical stock locations
- **Inventory** — per-product, per-warehouse stock counters (`totalStock`, `reservedStock`)
- **Reservation** — individual reservations with status and expiry

### ER Diagram

![ER Diagram](./prisma-schema.svg)

---

## How It Works

### Concurrency & Oversell Prevention

Inventory rows are locked at the database level during reservation creation:

```sql
SELECT * FROM "Inventory"
WHERE "productId" = $1
  AND "warehouseId" = $2
FOR UPDATE;
```

This serializes concurrent writes to the same row — only one transaction holds the lock at a time. Others queue and wait, ensuring stock counts stay consistent under load.

### Reservation Expiry

```
User creates reservation
        │
        ▼
Reserved stock incremented + expiry timestamp stored
        │
        ▼
BullMQ schedules delayed job
        │
        ▼
Job fires at expiry time
        │
        ▼
Status → expired, stock released back to available
```

---

## Local Setup

### Prerequisites

- Node.js
- Docker + Docker Compose

### 1. Clone

```bash
git clone <repo-url>
cd stocklock
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/stocklock?schema=public
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

Run migrations and seed:

```bash
npx prisma migrate dev
npx prisma db seed
```

Start the server:

```bash
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Docker (full stack)

```bash
docker compose up --build
```

---

## API Reference

### `GET /api/products`
Returns all available products.

### `GET /api/warehouses`
Returns all warehouse locations.

### `POST /api/reservations`
Creates a new reservation with row-level locking.

**Request body:**
```json
{
  "userId": 1,
  "productId": 1,
  "warehouseId": 1,
  "quantity": 2
}
```

---

## Known Trade-offs

| Area | Current Approach | Better Approach |
|---|---|---|
| **Worker** | Runs inside the backend process | Separate dedicated worker service |
| **Auth** | Demo/hardcoded users | JWT-based authentication |
| **Payments** | Simulated reservations only | Stripe integration |
| **Stock sync** | Polling-based | WebSocket live updates |

---

## Roadmap

- [ ] Separate BullMQ worker service
- [ ] JWT authentication
- [ ] WebSocket live inventory updates
- [ ] Stripe payment confirmation flow
- [ ] Admin dashboard + analytics
- [ ] Load testing with k6
- [ ] CI/CD pipeline
- [ ] Kubernetes deployment

---

## Author

**Rittul Raj**