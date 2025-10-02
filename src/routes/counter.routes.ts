import { Router } from 'express';
import * as counterController from '../controllers/counter.controller';
import * as counterValidator from '../middlewares/counter.validator';
import { MCache, MInvalidateCache, CachePresets } from '../middlewares/cache.middleware';

const router = Router();
const counterCachePattern = ['counters*'];

// Get all counters (cached)
router.get(
    '/', 
    MCache(CachePresets.short({ keyPrefix: 'counters' })), 
    counterController.CGetAllCounters
);

// Create a new counter (invalidates cache)
router.post(
    '/', 
    counterValidator.validateCreateCounter, 
    counterController.CCreateCounter, 
    MInvalidateCache(counterCachePattern)
);

// Get a single counter by ID (cached)
router.get(
    '/:id', 
    MCache(CachePresets.medium({ keyPrefix: 'counters' })), 
    counterController.CGetCounterById
);

// Update a counter (invalidates cache)
router.put(
    '/:id', 
    counterValidator.validateUpdateCounter, 
    counterController.CUpdateCounter, 
    MInvalidateCache(counterCachePattern)
);

// Update counter status (invalidates cache)
router.patch(
    '/:id/status', 
    counterValidator.validateUpdateStatus, 
    counterController.CUpdateCounterStatus, 
    MInvalidateCache(counterCachePattern)
);

// Delete a counter (invalidates cache)
router.delete(
    '/:id', 
    counterController.CDeleteCounter, 
    MInvalidateCache(counterCachePattern)
);

export default router;