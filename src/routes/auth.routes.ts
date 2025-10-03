import { Router } from 'express';
import { CLogin, CCreateAdmin, CGetAllAdmins, CUpdateAdmin, CDeleteAdmin, CGetAdminById} from '../controllers/auth.controller';
import { validateCreateAdmin } from '../middlewares/validate.middleware';
import { MCache, MInvalidateCache, CachePresets } from '../middlewares/cache.middleware';
import { MAuthenticate } from '../middlewares/authenticate.middleware';

const router = Router();
const adminCachePattern = ['admins*'];

router.post('/login', CLogin);
router.post('/create',  MAuthenticate, validateCreateAdmin, CCreateAdmin);
router.get('/',  MAuthenticate, MCache(CachePresets.medium({ keyPrefix: 'admins' })), CGetAllAdmins);
router.put('/update/:id', MAuthenticate, CUpdateAdmin, MInvalidateCache(adminCachePattern));
router.delete('/delete/:id', MAuthenticate, CDeleteAdmin, MInvalidateCache(adminCachePattern));

export default router;