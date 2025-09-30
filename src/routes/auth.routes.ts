import { Router } from 'express';
import { CLogin, CCreateAdmin, CGetAllAdmins, CUpdateAdmin, CDeleteAdmin} from '../controllers/auth.controller';
import { validateCreateAdmin } from '../middlewares/validate.middleware';
import { MCache, MInvalidateCache, CachePresets } from '../middlewares/cache.middleware';

const router = Router();

const adminCachePattern = ['admins*'];

router.post('/login', CLogin);
router.post('/create', validateCreateAdmin, CCreateAdmin);
router.get('/', MCache(CachePresets.medium({ keyPrefix: 'admins' })), CGetAllAdmins);
router.put('/update/:id', CUpdateAdmin, MInvalidateCache(adminCachePattern));
router.delete('/delete/:id', CDeleteAdmin, MInvalidateCache(adminCachePattern));

export default router;