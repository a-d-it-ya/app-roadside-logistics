import { Router } from 'express';
import { trackingController } from '../controllers/trackingController';

const router = Router();

router.get('/shipments/:id', trackingController.getShipmentTracking);
router.post('/shipments/:id/events', trackingController.recordEvent);
router.get('/shipments/:id/timeline', trackingController.getTimeline);

export default router;
