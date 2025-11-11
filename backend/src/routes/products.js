import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/products (list)
router.get('/', async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
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
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const created = await prisma.product.create({ data: { name } });
    res.status(201).json(created);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Product already exists' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/products/:id/parts (list components with stock and required)
router.get('/:id/parts', async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const rows = await prisma.productComponent.findMany({
      where: { productId },
      include: { item: true },
    });
    const parts = rows.map((r) => ({
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
    const productId = Number(req.params.id);
    const { itemId, itemName, required, stock } = req.body;
    if ((itemId == null && !itemName) || required == null) {
      return res.status(400).json({ message: 'Provide itemId or itemName and required' });
    }
    // Resolve item by id or name (create if missing when name provided)
    let resolvedItemId;
    if (itemId != null) {
      const numberId = Number(itemId);
      if (Number.isNaN(numberId)) return res.status(400).json({ message: 'Invalid itemId' });
      // Optionally update stock
      if (stock != null) {
        await prisma.item.update({ where: { id: numberId }, data: { quantity: Number(stock) } }).catch(() => {});
      }
      resolvedItemId = numberId;
    } else {
      const name = String(itemName).trim();
      let item = await prisma.item.findFirst({ where: { name } });
      if (!item) {
        item = await prisma.item.create({
          data: { name, category: 'General', quantity: Number(stock) || 0, requiredPerProduct: 0 },
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

// GET /api/products/:id/can-build
router.get('/:id/can-build', async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const rows = await prisma.productComponent.findMany({
      where: { productId },
      include: { item: { select: { quantity: true, name: true } } },
    });
    const details = rows.map((r) => ({
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
    const productId = Number(req.params.id);
    const quantity = Number(req.body.quantity);
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be > 0' });
    }
    const rows = await prisma.productComponent.findMany({
      where: { productId },
      include: { item: true },
    });
    if (rows.length === 0) {
      return res.status(400).json({ message: 'No parts linked to this product' });
    }
    const maxByPart = rows.map((r) =>
      r.required > 0 ? Math.floor(r.item.quantity / r.required) : 0
    );
    const canBuild = Math.min(...maxByPart);
    if (quantity > canBuild) {
      return res.status(400).json({ message: `Not enough stock. Can build ${canBuild}.` });
    }
    // Subtract quantities in a transaction
    await prisma.$transaction(
      rows.map((r) =>
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


