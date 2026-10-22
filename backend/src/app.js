const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const env = require('./config/env');
const language = require('./middlewares/language');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const routes = require('./routes');

const app = express();

app.set('trust proxy', 1); // behind Render / Railway proxies
app.disable('x-powered-by');

app.use(helmet());
app.use(
  cors({
    origin(origin, cb) {
      // Allow server-to-server calls (no Origin), listed origins, and Vercel previews if enabled.
      if (!origin || env.corsOrigins.includes('*') || env.corsOrigins.includes(origin)) {
        return cb(null, true);
      }
      if (process.env.CORS_ALLOW_VERCEL_PREVIEWS === 'true' && /\.vercel\.app$/.test(new URL(origin).hostname)) {
        return cb(null, true);
      }
      return cb(null, false);
    },
  })
);
app.use(compression());
app.use(express.json({ limit: '100kb' }));
app.use(morgan(env.isProd ? 'combined' : 'dev'));
app.use(language);

app.get('/', (req, res) => {
  res.json({ name: 'Evim API', version: '1.0.0', docs: '/api/health' });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
