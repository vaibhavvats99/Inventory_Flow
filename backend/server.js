import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './src/routes/auth.js';
import itemRoutes from './src/routes/items.js';
import inventoryRoutes from './src/routes/inventory.js';
import productRoutes from './src/routes/products.js';
import { verifyJWT } from './src/middleware/auth.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running successfully!');
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'inventoryflow-backend' });
});

app.use('/api/auth', authRoutes);

app.use('/api/items', verifyJWT, itemRoutes);
app.use('/api/inventory', verifyJWT, inventoryRoutes);
app.use('/api/products', verifyJWT, productRoutes);

const PORT = process.env.PORT || 5001;

async function start() {
  try {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();


