const { z } = require('zod');

// Flexible Zod setup template (JavaScript)
// This file is intentionally generic so users can adapt it to any module.

const mapZodError = (error) => {
  return error.issues.map((issue) => ({
    path: issue.path.join('.') || 'root',
    message: issue.message,
    code: issue.code,
  }));
};

const formatValidationError = (error) => ({
  message: 'Validation failed',
  issues: mapZodError(error),
});

const validateData = (schema, data) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: formatValidationError(result.error),
    };
  }

  return {
    success: true,
    data: result.data,
  };
};

// Optional Express-compatible middleware factory.
// Keep it as a template and wire where needed later.
const createValidationMiddleware = (schema, target = 'body') => {
  return (req, res, next) => {
    const result = validateData(schema, req[target]);

    if (!result.success) {
      res.status(400).json(result.error);
      return;
    }

    req.validated = req.validated || {};
    req.validated[target] = result.data;
    next();
  };
};

// Example base schemas users can extend.
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

const idParamSchema = z.object({
  id: z.string().min(1, 'id is required'),
});

const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.email(),
  password: z.string().min(8),
});

module.exports = {
  z,
  validateData,
  formatValidationError,
  createValidationMiddleware,
  paginationSchema,
  idParamSchema,
  createUserSchema,
};

// Example usage (wire later):
// router.post('/users', createValidationMiddleware(createUserSchema, 'body'), controller);
// router.get('/users', createValidationMiddleware(paginationSchema, 'query'), controller);
