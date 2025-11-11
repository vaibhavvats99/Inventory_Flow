# Backend (Prisma + SQLite) - Deploy / Run

## Local Development

1. Install deps:
   - `npm install`
2. Create `.env` in `backend/` with:
   - `DATABASE_URL="file:./prisma/dev.db"`
   - `JWT_SECRET=your-long-random-string`
   - `PORT=5000`
3. Initialize database:
   - `npm run prisma:generate`
   - `npm run prisma:migrate`
4. Start API:
   - `npm run dev`

Health check: `GET /api/health` should return JSON.

## Deployment (Render/Railway)

- For simple demos, keep `DATABASE_URL` as SQLite and add a persistent disk.
- For production, use Postgres:
  - Set `DATABASE_URL` to your Postgres URL
  - Build Command: `npm install && npx prisma generate`
  - Start Command: `npm start`
  - After first deploy, run `npx prisma migrate deploy` via a shell or a deploy hook.
  - Environment:
    - `JWT_SECRET` = long random string
    - `PORT` = 5000 (or as provided by host)

