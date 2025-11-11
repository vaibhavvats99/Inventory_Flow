import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/items (public)
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '10',
      search = '',
      category = '',
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * pageSize;

    const where = {
      AND: [
        search
          ? { name: { contains: String(search), mode: 'insensitive' } }
          : {},
        category ? { category: { equals: String(category) } } : {},
      ],
    };

    const total = await prisma.item.count({ where });
    const items = await prisma.item.findMany({
      where,
      orderBy: { [sort]: order === 'asc' ? 'asc' : 'desc' },
      skip,
      take: pageSize,
    });

    return res.json({ items, total, page: pageNum, limit: pageSize });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/items (public)
router.post('/', async (req, res) => {
  try {
    const { name, category, quantity = 0, requiredPerProduct = 0 } = req.body;
    if (!name || !category) {
      return res.status(400).json({ message: 'Name and category are required' });
    }
    const item = await prisma.item.create({
      data: {
        name,
        category,
        quantity: Number(quantity) || 0,
        requiredPerProduct: Number(requiredPerProduct) || 0,
      },
    });
    return res.status(201).json(item);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/items/:id (public)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, requiredPerProduct } = req.body;
    const item = await prisma.item.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(quantity !== undefined ? { quantity: Number(quantity) } : {}),
        ...(requiredPerProduct !== undefined
          ? { requiredPerProduct: Number(requiredPerProduct) }
          : {}),
      },
    });
    return res.json(item);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Item not found' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/items/:id (public)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.item.delete({ where: { id: Number(id) } });
    return res.json({ message: 'Item deleted' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Item not found' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;


