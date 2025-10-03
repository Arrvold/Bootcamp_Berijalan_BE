import express from 'express';
import cors from 'cors';
import authRoutes from '../src/routes/auth.routes';
import counterRoutes from './routes/counter.routes';
import { MErrorHandler } from '../src/middlewares/error.middleware';
import { connectRedis } from './configs/redis.config';
import publicRoutes from './routes/public.routes';
import queueRoutes from './routes/queue.routes';

connectRedis();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/counters", counterRoutes); 
app.use('/api/v1', publicRoutes);
app.use("/api/v1/queues", queueRoutes);

app.use(MErrorHandler);
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

