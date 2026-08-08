import app from './app.js';
import { config } from './config/index.js';

const port = config.port;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port} in ${config.nodeEnv} mode`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
