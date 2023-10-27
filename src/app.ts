import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';

import logger from './config/logger';
import authRouter from './routes/auth.routes';

const app = express();
app.use(express.json());

app.use('/auth', authRouter);

/*
    Whenever there is any error inside any route, it get caught in global express error handler.
    If there is async function then any error inside that function will not caught by gloabl express
    middleware, so use GEEH we use next(error) inside async funtion inside any route
*/
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        msg: err.message,
        path: '',
        location: '',
      },
    ],
  });
  next();
});

export default app;
