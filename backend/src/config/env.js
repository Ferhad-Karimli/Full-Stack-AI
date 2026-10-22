require('dotenv').config();

const required = ['DATABASE_URL'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`[env] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL,
  // "true" forces SSL (Neon, Supabase, Render external URLs need it)
  databaseSsl: process.env.DATABASE_SSL === 'true',
  // Comma-separated list, e.g. "https://evim.vercel.app,http://localhost:3000"
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
};

env.isProd = env.nodeEnv === 'production';

module.exports = env;
