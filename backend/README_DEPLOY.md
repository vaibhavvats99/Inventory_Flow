# Backend (Prisma + Postgres) - Deploy / Run

## Local Development

1. Install deps:
   - `npm install`
2. Create `.env` in `backend/` with:
   - For local SQLite testing: `DATABASE_URL="file:./prisma/dev.db"`
   - For Postgres (Neon DB): `DATABASE_URL="postgresql://<user>:<password>@<endpoint>.neon.tech/<database>?sslmode=require"`
   - `JWT_SECRET=your-long-random-string`
   - (Optional) `PORT=5001` for local development only. **Do not** set this variable in hosted environments; platforms like Render inject their own `PORT`.
3. Initialize database:
   - `npm run prisma:generate`
   - `npm run prisma:migrate`
4. Start API:
   - `npm run dev`

Health check: `GET /api/health` should return JSON.

## Deployment (Render/Railway)

- For simple demos, you may keep `DATABASE_URL` as SQLite locally, but production should use Postgres (Neon DB).
- For production (Render, Railway, etc.), use Neon DB:
  - Set `DATABASE_URL` to your Neon DB connection string from the Neon dashboard (includes `sslmode=require`)
  - Build Command: `npm install && npx prisma generate`
  - Start Command: `npm start`
  - After first deploy, run `npx prisma migrate deploy` via a shell or a deploy hook.
  - Environment:
    - `JWT_SECRET` = long random string
    - Do **not** override `PORT`; allow the platform to supply it.

