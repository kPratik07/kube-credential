import express, { Application } from 'express';
import cors from 'cors';
import issueRoutes from './routes/issue';

export function createServer(): Application {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api', issueRoutes);

  return app;
}
