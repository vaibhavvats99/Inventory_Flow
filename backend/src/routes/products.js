import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/products (list) - only user's products
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const products = await prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/products (create)
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    
    // Verify user exists before creating product
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({ message: 'User not found. Please log in again.' });
    }
    
    const created = await prisma.product.create({ 
      data: { name, userId } 
    });
    res.status(201).json(created);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Product with this name already exists' });
    }
    console.error('Product creation error:', err);
    // Return more specific error message for debugging
    const errorMessage = err.message || 'Server error';
    return res.status(500).json({ message: errorMessage });
  }
});

// GET /api/products/:id/parts (list components with stock and required)
router.get('/:id/parts', async (req, res) => {
  try {
    const userId = req.userId;
    const productId = Number(req.params.id);
    
    // Verify product belongs to user
    const product = await prisma.product.findFirst({
      where: { id: productId, userId },
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const rows = await prisma.productComponent.findMany({
      where: { productId },
      include: { item: true },
    });
    
    // Filter items to only include user's items
    const userRows = rows.filter(row => row.item.userId === userId);
    const parts = userRows.map((r) => ({
      itemId: r.itemId,
      name: r.item.name,
      stock: r.item.quantity,
      required: r.required,
      maxByThisPart: r.required > 0 ? Math.floor(r.item.quantity / r.required) : 0,
    }));
    const canBuild =
      parts.length > 0
        ? Math.min(...parts.map((p) => p.maxByThisPart))
        : 0;
    res.json({ parts, canBuild });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/products/:id/parts (add/update a component requirement)
router.post('/:id/parts', async (req, res) => {
  try {
    const userId = req.userId;
    const productId = Number(req.params.id);
    
    // Verify product belongs to user
    const product = await prisma.product.findFirst({
      where: { id: productId, userId },
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const { itemId, itemName, required, stock } = req.body;
    if ((itemId == null && !itemName) || required == null) {
      return res.status(400).json({ message: 'Provide itemId or itemName and required' });
    }
    // Resolve item by id or name (create if missing when name provided)
    let resolvedItemId;
    if (itemId != null) {
      const numberId = Number(itemId);
      if (Number.isNaN(numberId)) return res.status(400).json({ message: 'Invalid itemId' });
      // Verify item belongs to user and optionally update stock
      const item = await prisma.item.findFirst({ where: { id: numberId, userId } });
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
      if (stock != null) {
        await prisma.item.update({ where: { id: numberId }, data: { quantity: Number(stock) } });
      }
      resolvedItemId = numberId;
    } else {
      const name = String(itemName).trim();
      let item = await prisma.item.findFirst({ where: { name, userId } });
      if (!item) {
        item = await prisma.item.create({
          data: { name, category: 'General', quantity: Number(stock) || 0, requiredPerProduct: 0, userId },
        });
      } else if (stock != null) {
        item = await prisma.item.update({ where: { id: item.id }, data: { quantity: Number(stock) } });
      }
      resolvedItemId = item.id;
    }
    const upserted = await prisma.productComponent.upsert({
      where: { productId_itemId: { productId, itemId: resolvedItemId } },
      update: { required: Number(required) },
      create: { productId, itemId: resolvedItemId, required: Number(required) },
    });
    res.status(201).json(upserted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/products/:id/parts/:itemId
router.delete('/:id/parts/:itemId', async (req, res) => {
  try {
    const userId = req.userId;
    const productId = Number(req.params.id);
    const itemId = Number(req.params.itemId);
    
    // Verify product belongs to user
    const product = await prisma.product.findFirst({
      where: { id: productId, userId },
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await prisma.productComponent.delete({
      where: { productId_itemId: { productId, itemId } },
    });
    res.json({ message: 'Part removed' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Part not found for this product' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/products/:id/can-build
router.get('/:id/can-build', async (req, res) => {
  try {
    const userId = req.userId;
    const productId = Number(req.params.id);
    
    // Verify product belongs to user
    const product = await prisma.product.findFirst({
      where: { id: productId, userId },
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const rows = await prisma.productComponent.findMany({
      where: { productId },
      include: { item: { select: { quantity: true, name: true, userId: true } } },
    });
    
    // Filter items to only include user's items
    const userRows = rows.filter(row => row.item.userId === userId);
    const details = userRows.map((r) => ({
      name: r.item.name,
      quantity: r.item.quantity,
      requiredPerProduct: r.required,
      maxByThisPart: r.required > 0 ? Math.floor(r.item.quantity / r.required) : 0,
    }));
    const canBuild =
      details.length > 0
        ? Math.min(...details.map((d) => d.maxByThisPart))
        : 0;
    res.json({ canBuild, details });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/products/:id/build  { quantity }
// Subtracts inventory for the selected product if enough stock is available
router.post('/:id/build', async (req, res) => {
  try {
    const userId = req.userId;
    const productId = Number(req.params.id);
    const quantity = Number(req.body.quantity);
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be > 0' });
    }
    
    // Verify product belongs to user
    const product = await prisma.product.findFirst({
      where: { id: productId, userId },
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const rows = await prisma.productComponent.findMany({
      where: { productId },
      include: { item: true },
    });
    
    // Filter items to only include user's items
    const userRows = rows.filter(row => row.item.userId === userId);
    if (userRows.length === 0) {
      return res.status(400).json({ message: 'No parts linked to this product' });
    }
    const maxByPart = userRows.map((r) =>
      r.required > 0 ? Math.floor(r.item.quantity / r.required) : 0
    );
    const canBuild = Math.min(...maxByPart);
    if (quantity > canBuild) {
      return res.status(400).json({ message: `Not enough stock. Can build ${canBuild}.` });
    }
    // Subtract quantities in a transaction
    await prisma.$transaction(
      userRows.map((r) =>
        prisma.item.update({
          where: { id: r.itemId },
          data: { quantity: r.item.quantity - r.required * quantity },
        })
      )
    );
    res.json({ message: 'Build completed', built: quantity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;


