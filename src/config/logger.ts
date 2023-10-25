import winston from 'winston';
import { Config } from './index';

const logger = winston.createLogger({
  level: 'info',
  defaultMeta: {
    serviceName: 'auth-service',
  },
  transports: [
    new winston.transports.File({
      dirname: 'logs',
      filename: 'app.log',
      level: 'info',
      silent: Config.NODE_ENV === 'test',
    }),
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});

export default logger;
