const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { applicationSchema, reviewActionSchema, validate } = require('../validators/schemas');

const prisma = new PrismaClient();

const VALID_TRANSITIONS = {
  APPLICANT: {
    DRAFT: 'SUBMITTED',
    AMENDMENT_REQUESTED: 'SUBMITTED',
  },
  EXAMINER: {
    SUBMITTED: ['UNDER_REVIEW'],
    UNDER_REVIEW: ['APPROVED', 'REJECTED', 'AMENDMENT_REQUESTED'],
  },
};

function actionToStatus(action) {
  const map = {
    START_REVIEW: 'UNDER_REVIEW',
    APPROVE: 'APPROVED',
    REJECT: 'REJECTED',
    REQUEST_AMENDMENT: 'AMENDMENT_REQUESTED',
  };
  return map[action];
}

router.get('/', authenticate, async (req, res, next) => {
  try {
    const where =
      req.user.role === 'APPLICANT'
        ? { applicantId: req.user.id }
        : { status: { not: 'DRAFT' } };

    const applications = await prisma.application.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: { applicant: { select: { name: true, email: true } } },
    });
    res.json(applications);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const app = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        applicant: { select: { name: true, email: true } },
        auditLogs: {
          orderBy: { createdAt: 'asc' },
          include: { actor: { select: { name: true, role: true } } },
        },
      },
    });
    if (!app) return res.status(404).json({ error: 'Application not found' });

    if (req.user.role === 'APPLICANT' && app.applicantId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(app);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  authenticate,
  requireRole('APPLICANT'),
  validate(applicationSchema),
  async (req, res, next) => {
    try {
      const { title, abstract, claims, inventorName } = req.validatedBody;
      const app = await prisma.application.create({
        data: {
          title,
          abstract,
          claims,
          inventorName,
          applicantId: req.user.id,
          status: 'DRAFT',
        },
      });
      res.status(201).json(app);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id',
  authenticate,
  requireRole('APPLICANT'),
  validate(applicationSchema),
  async (req, res, next) => {
    try {
      const existing = await prisma.application.findUnique({ where: { id: req.params.id } });
      if (!existing) return res.status(404).json({ error: 'Not found' });
      if (existing.applicantId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
      if (existing.status !== 'DRAFT') {
        return res.status(400).json({ error: 'Only DRAFT applications can be edited' });
      }

      const updated = await prisma.application.update({
        where: { id: req.params.id },
        data: req.validatedBody,
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/:id/submit', authenticate, requireRole('APPLICANT'), async (req, res, next) => {
  try {
    const app = await prisma.application.findUnique({ where: { id: req.params.id } });
    if (!app) return res.status(404).json({ error: 'Not found' });
    if (app.applicantId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const allowed = VALID_TRANSITIONS.APPLICANT[app.status];
    if (!allowed) {
      return res.status(400).json({ error: `Cannot submit from status: ${app.status}` });
    }

    const [updated] = await prisma.$transaction([
      prisma.application.update({
        where: { id: app.id },
        data: { status: 'SUBMITTED' },
      }),
      prisma.auditLog.create({
        data: {
          applicationId: app.id,
          actorId: req.user.id,
          fromStatus: app.status,
          toStatus: 'SUBMITTED',
        },
      }),
    ]);

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/:id/review',
  authenticate,
  requireRole('EXAMINER'),
  validate(reviewActionSchema),
  async (req, res, next) => {
    try {
      const app = await prisma.application.findUnique({ where: { id: req.params.id } });
      if (!app) return res.status(404).json({ error: 'Not found' });

      const { action, note } = req.validatedBody;
      const toStatus = actionToStatus(action);
      const allowedFrom = VALID_TRANSITIONS.EXAMINER[app.status];

      if (!allowedFrom || !allowedFrom.includes(toStatus)) {
        return res.status(400).json({
          error: `Invalid transition: ${app.status} → ${toStatus}`,
        });
      }

      const [updated] = await prisma.$transaction([
        prisma.application.update({
          where: { id: app.id },
          data: { status: toStatus },
        }),
        prisma.auditLog.create({
          data: {
            applicationId: app.id,
            actorId: req.user.id,
            fromStatus: app.status,
            toStatus,
            note: note || null,
          },
        }),
      ]);

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
