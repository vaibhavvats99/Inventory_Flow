# InventoryFlow

A simple inventory management system built with React, Express, and Prisma.

## Features

- User authentication with JWT tokens
- User-specific data isolation (each user sees only their own products and items)
- Product management
- Item/Part management
- Build products from parts
- Low stock alerts
- Real-time inventory tracking

## Tech Stack

### Frontend
- React
- React Router
- Axios
- Vite

### Backend
- Node.js
- Express
- Prisma (SQLite)
- JWT Authentication
- bcryptjs for password hashing

## Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Inventory_Flow_Project
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Setup database
```bash
cd ../backend
npx prisma generate
npx prisma db push
```

5. Start the backend server
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:5001`

6. Start the frontend (in a new terminal)
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

## Usage

1. Sign up for a new account or log in
2. Create products in the Dashboard
3. Link parts/items to products
4. Use the Build page to check availability and build products
5. Monitor low stock alerts

## Project Structure

```
Inventory_Flow_Project/
├── backend/
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Auth middleware
│   │   └── lib/         # Prisma client
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── server.js        # Express server
└── frontend/
    ├── src/
    │   ├── pages/       # React pages
    │   ├── components/  # Reusable components
    │   ├── api/         # API configuration
    │   └── styles.css   # Global styles
    └── App.jsx          # Main app component
```

## Deployment

### Backend (Render)

1. Push your backend code to GitHub
2. Connect your GitHub repo to Render
3. Set environment variables in Render:
   - `DATABASE_URL` (if using external database)
   - `JWT_SECRET` (for production, use a strong random string)
   - `PORT` (Render sets this automatically)
4. Your backend will be available at: `https://inventory-flow.onrender.com`

### Frontend (Vercel/Netlify/Render)

1. Push your frontend code to GitHub
2. Connect your GitHub repo to your hosting service
3. Set environment variable:
   - `VITE_API_BASE_URL=https://inventory-flow.onrender.com`
4. Build command: `npm run build`
5. Output directory: `dist`

**Important:** Make sure to set the `VITE_API_BASE_URL` environment variable in your frontend hosting service to point to your Render backend URL.

### Local Development

For local development, create a `.env` file in the frontend folder:
```
VITE_API_BASE_URL=http://localhost:5001
```

The code will automatically use `http://localhost:5001` if no environment variable is set.

## Notes

- Each user has their own isolated data
- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- Database is SQLite (stored in `backend/prisma/dev.db`)

