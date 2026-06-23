const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const applicationSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(300),
  abstract: z.string().min(50, 'Abstract must be at least 50 characters').max(2000),
  claims: z.string().min(20, 'Claims must be at least 20 characters'),
  inventorName: z.string().min(2, 'Inventor name required'),
});

const reviewActionSchema = z
  .object({
    action: z.enum(['APPROVE', 'REJECT', 'REQUEST_AMENDMENT', 'START_REVIEW']),
    note: z.string().optional(),
  })
  .refine(
    (data) => {
      if (['REJECT', 'REQUEST_AMENDMENT'].includes(data.action)) {
        return data.note && data.note.trim().length >= 10;
      }
      return true;
    },
    {
      message:
        'A note of at least 10 characters is required when rejecting or requesting amendment',
    }
  );

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
    }
    req.validatedBody = result.data;
    next();
  };
}

module.exports = {
  registerSchema,
  loginSchema,
  applicationSchema,
  reviewActionSchema,
  validate,
};
