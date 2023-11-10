import { Request, NextFunction, Response } from 'express';
import createHttpError from 'http-errors';
import { AuthRequest } from '../types';

export default (role: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const _req = req as AuthRequest;
    const roleFromToken = _req.auth.role;

    if (!role.includes(roleFromToken)) {
      const error = createHttpError(
        403,
        'You dont have permission to perform this action',
      );
      return next(error);
    }
    next();
  };
};
