import { Config } from './config';
import logger from './config/logger';
import app from './app';

const startServer = () => {
  const PORT = Config.PORT;
  try {
    app.listen(PORT, () => {
      logger.info(`Server is running on ${PORT}`);
    });
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

startServer();
