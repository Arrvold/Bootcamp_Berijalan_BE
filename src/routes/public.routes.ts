import { Router } from 'express';
import { CClaimQueue, CReleaseQueue } from '../controllers/queue.controller';
import { CGetCurrentCounters } from '../controllers/counter.controller';
import { CGetQueueMetrics } from '../controllers/queue.controller';

const router = Router();

// Endpoint untuk pelanggan
router.post('/claim', CClaimQueue);
router.patch('/release/:id', CReleaseQueue);
router.get('/current', CGetCurrentCounters);
router.get('/metrics', CGetQueueMetrics);

export default router;