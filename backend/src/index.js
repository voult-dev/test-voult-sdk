import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import sessionConfig from './config/session.js';
import syncVoultClient from './middleware/syncVoultClient.js';
import errorHandler from './middleware/errorHandler.js';
import apiRoutes from './routes/api.js';
import oauthFlowRoutes from './routes/oauthFlow.js';

const app = express();
const PORT = Number(process.env.PORT || process.env.port || 2000);

const allowedOrigins = [
  process.env.APP_BASE_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(session(sessionConfig));
app.use(syncVoultClient);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'voult-playground-bff' });
});

app.use('/api', apiRoutes);
app.use('/oauth', oauthFlowRoutes);

app.use((_req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Route not found', status: 404 },
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Voult playground BFF running on http://localhost:${PORT}`);
});
