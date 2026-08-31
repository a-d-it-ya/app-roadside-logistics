import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRouter from '../server/src/routes';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount all API routes
app.use('/api', apiRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'roadside-logistics-serverless',
    database: 'supabase-postgresql',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default app;
