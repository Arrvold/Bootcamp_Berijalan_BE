import { Router } from 'express';
import * as queueController from '../controllers/queue.controller';
import * as queueValidator from '../middlewares/queue.validator';
import { MCache, MInvalidateCache, CachePresets } from '../middlewares/cache.middleware';

const router = Router();
const queueCachePattern = ['queues*'];

// Get all queues 
router.get(
    '/', 
    MCache(CachePresets.short({ keyPrefix: 'queues' })), 
    queueController.CGetAllQueues
);

// Create a new queue 
router.post(
    '/', 
    queueValidator.validateCreateQueue, 
    queueController.CCreateQueue, 
    MInvalidateCache(queueCachePattern)
);

// Get a single queue by ID 
router.get(
    '/:id', 
    MCache(CachePresets.medium({ keyPrefix: 'queues' })), 
    queueController.CGetQueueById
);

// Update queue status 
router.patch(
    '/:id/status', 
    queueValidator.validateUpdateStatus, 
    queueController.CUpdateQueueStatus, 
    MInvalidateCache(queueCachePattern)
);

// Delete a queue 
router.delete(
    '/:id', 
    queueController.CDeleteQueue, 
    MInvalidateCache(queueCachePattern)
);

export default router;