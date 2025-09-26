import { Router } from 'express';
import { CLogin, CCreateAdmin, CGetAllAdmins, CUpdateAdmin, CDeleteAdmin} from '../controllers/auth.controller';
import { validateCreateAdmin } from '../middlewares/validate.middleware';

const router = Router();

router.post('/login', CLogin);
router.post('/create', validateCreateAdmin, CCreateAdmin);
router.get('/', CGetAllAdmins);
router.put('/update/:id', CUpdateAdmin);
router.delete('/delete/:id', CDeleteAdmin);

export default router;