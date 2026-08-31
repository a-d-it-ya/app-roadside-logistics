import { Router } from 'express';
import { hubController } from '../controllers/hubController';

const router = Router();

router.get('/', hubController.listHubs);
router.get('/search/nearby', hubController.findNearby);
router.get('/:id', hubController.getHub);
router.post('/', hubController.createHub);

export default router;
