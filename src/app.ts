import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import departmentRoutes from './routes/department.routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }),
);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/department', departmentRoutes);

export default app;
