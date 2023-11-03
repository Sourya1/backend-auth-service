import { Config } from './config';
import logger from './config/logger';
import app from './app';
import { AppDataSource } from './config/data-source';

const startServer = async () => {
  const PORT = Config.PORT;
  try {
    await AppDataSource.initialize();
    logger.info('Database connected successfully');
    app.listen(PORT, () => {
      logger.info(`Server is running on ${PORT}`);
    });
  } catch (err) {
    logger.error(err);
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
};

void startServer();
