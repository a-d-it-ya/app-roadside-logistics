import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRouter from './routes';

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow all origins in dev or matching client origins
        callback(null, true);
      },
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Mount
  app.use('/api', apiRouter);

  // 404 Handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: 'API route not found',
    });
  });

  return app;
}
