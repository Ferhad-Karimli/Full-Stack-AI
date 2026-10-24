const env = require('./config/env');
const app = require('./app');
const { pool } = require('./db/pool');

const server = app.listen(env.port, () => {
  console.log(`[server] Evim API listening on port ${env.port} (${env.nodeEnv})`);
});

const shutdown = (signal) => {
  console.log(`[server] ${signal} received, shutting down`);
  server.close(() => pool.end().then(() => process.exit(0)));
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
