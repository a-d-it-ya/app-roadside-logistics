import { Router } from 'express';
import { orgController } from '../controllers/orgController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', orgController.listUserOrganizations);
router.post('/', orgController.createOrganization);
router.get('/:id/members', orgController.listMembers);

export default router;
