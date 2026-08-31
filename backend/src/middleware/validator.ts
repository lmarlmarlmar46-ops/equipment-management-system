import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './errorHandler';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors: Record<string, string[]> = {};

    errors.array().forEach((error: any) => {
      const field = error.path || error.param;
      if (!formattedErrors[field]) {
        formattedErrors[field] = [];
      }
      formattedErrors[field].push(error.msg);
    });

    throw new AppError(
      'Validation failed',
      422,
      'VALIDATION_ERROR',
      { fields: formattedErrors }
    );
  }

  next();
};

export default validateRequest;
