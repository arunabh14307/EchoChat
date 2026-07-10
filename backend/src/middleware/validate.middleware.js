import { ZodError } from 'zod';
import ApiError from '../utils/ApiError.js';

/**
 * validate — Express middleware factory that validates req.body against a Zod schema.
 *
 * On success: parses (and strips unknown fields) then calls next().
 * On failure: passes a 400 ApiError with all Zod messages to the error handler.
 *
 * @param {import('zod').ZodSchema} schema
 * @returns {import('express').RequestHandler}
 */
export const validate = (schema) => (req, _res, next) => {
  try {
    // parse() strips unknown fields and coerces types
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.errors.map((e) => e.message);
      return next(ApiError.badRequest('Validation failed', messages));
    }
    next(error);
  }
};
