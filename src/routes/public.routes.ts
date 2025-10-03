import { Router } from 'express';
import { CClaimQueue, CReleaseQueue } from '../controllers/queue.controller';
import { CGetCurrentCounters } from '../controllers/counter.controller';

const router = Router();

// Endpoint untuk pelanggan
router.post('/claim', CClaimQueue);
router.patch('/release/:id', CReleaseQueue);
router.get('/current', CGetCurrentCounters);

export default router;