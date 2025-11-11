import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/inventory/calculate
// Calculates how many complete products can be made based on user's items where requiredPerProduct > 0
router.get('/calculate', async (req, res) => {
  try {
    const userId = req.userId;
    const components = await prisma.item.findMany({
      where: { 
        userId,
        requiredPerProduct: { gt: 0 } 
      },
      select: { name: true, quantity: true, requiredPerProduct: true },
    });

    if (components.length === 0) {
      return res.json({ canBuild: 0, details: [] });
    }

    const details = components.map((c) => ({
      name: c.name,
      quantity: c.quantity,
      requiredPerProduct: c.requiredPerProduct,
      maxByThisPart: Math.floor(c.quantity / c.requiredPerProduct),
    }));

    const canBuild = details.reduce(
      (min, d) => (d.maxByThisPart < min ? d.maxByThisPart : min),
      Number.POSITIVE_INFINITY
    );

    return res.json({ canBuild: isFinite(canBuild) ? canBuild : 0, details });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;


