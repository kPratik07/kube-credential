import express, { Application } from 'express';
import cors from 'cors';
import verifyRoutes from './routes/verify';

export function createServer(): Application {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api', verifyRoutes);

  return app;
}
