const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const prisma = new PrismaClient();

router.get('/users', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

const roleSchema = z.object({ role: z.enum(['APPLICANT', 'EXAMINER', 'ADMIN']) });

router.patch('/users/:id/role', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const result = roleSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: 'Invalid role' });

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: result.data.role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.get('/audit-logs', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        actor: { select: { name: true, role: true } },
        application: { select: { title: true } },
      },
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
