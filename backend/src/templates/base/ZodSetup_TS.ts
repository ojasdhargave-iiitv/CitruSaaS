import { z, ZodError } from 'zod';
import type { ZodTypeAny } from 'zod';

// Flexible Zod setup template (TypeScript)
// This file is intentionally generic so users can adapt it to any module.

export type ValidationTarget = 'body' | 'query' | 'params';

export interface ValidationIssue {
  path: string;
  message: string;
  code: string;
}

export interface ValidationErrorResponse {
  message: string;
  issues: ValidationIssue[];
}

const mapZodError = (error: ZodError): ValidationIssue[] => {
  return error.issues.map((issue) => ({
    path: issue.path.join('.') || 'root',
    message: issue.message,
    code: issue.code,
  }));
};

export const formatValidationError = (error: ZodError): ValidationErrorResponse => ({
  message: 'Validation failed',
  issues: mapZodError(error),
});

export const validateData = <TSchema extends ZodTypeAny>(
  schema: TSchema,
  data: unknown
): { success: true; data: z.infer<TSchema> } | { success: false; error: ValidationErrorResponse } => {
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
export const createValidationMiddleware = <TSchema extends ZodTypeAny>(
  schema: TSchema,
  target: ValidationTarget = 'body'
) => {
  return (req: any, res: any, next: any): void => {
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
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'id is required'),
});

export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.email(),
  password: z.string().min(8),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// Example usage (wire later):
// router.post('/users', createValidationMiddleware(createUserSchema, 'body'), controller);
// router.get('/users', createValidationMiddleware(paginationSchema, 'query'), controller);
