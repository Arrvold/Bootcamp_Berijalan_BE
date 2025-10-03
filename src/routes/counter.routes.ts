import { Router } from 'express';
import * as counterController from '../controllers/counter.controller';
import * as counterValidator from '../middlewares/counter.validator';
import { MCache, MInvalidateCache, CachePresets } from '../middlewares/cache.middleware';
import { MAuthenticate } from '../middlewares/authenticate.middleware';

const router = Router();
const counterCachePattern = ['counters*', 'queues*'];

router.use(MAuthenticate)

// Get all counters 
router.get(
    '/', 
    MCache(CachePresets.short({ keyPrefix: 'counters' })), 
    counterController.CGetAllCounters
);

// Create a new counter 
router.post(
    '/', 
    counterValidator.validateCreateCounter, 
    counterController.CCreateCounter, 
    MInvalidateCache(counterCachePattern)
);

// Get a single counter by ID 
router.get(
    '/:id', 
    MCache(CachePresets.medium({ keyPrefix: 'counters' })), 
    counterController.CGetCounterById
);

// Update a counter 
router.put(
    '/:id', 
    counterValidator.validateUpdateCounter, 
    counterController.CUpdateCounter, 
    MInvalidateCache(counterCachePattern)
);

// Update counter status 
router.patch(
    '/:id/status', 
    counterValidator.validateUpdateStatus, 
    counterController.CUpdateCounterStatus, 
    MInvalidateCache(counterCachePattern)
);

// Delete a counter 
router.delete(
    '/:id', 
    counterController.CDeleteCounter, 
    MInvalidateCache(counterCachePattern)
);

router.post('/:id/next', counterController.CNextQueueForCounter, MInvalidateCache(counterCachePattern));
router.post('/reset', counterController.CResetCounters, MInvalidateCache(counterCachePattern));

export default router;