import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import cookieParser from 'cookie-parser';

import logger from './config/logger';
import authRouter from './routes/auth';
import tenentRouter from './routes/tenent';
import userRouter from './routes/user';

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/tenents', tenentRouter);
app.use('/users', userRouter);

/*
    Whenever there is any error inside any route, it get caught in global express error handler.
    If there is async function then any error inside that function will not caught by gloabl express
    middleware, so to use GEEH we use next(error) inside async funtion inside any route
*/
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  const statusCode = err.statusCode || err.status || 500;

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
