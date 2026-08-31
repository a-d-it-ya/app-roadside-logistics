import { Router } from 'express';
import { tripController } from '../controllers/tripController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', tripController.listTrips);
router.get('/:id', tripController.getTrip);

// Protected mutation routes
router.post('/', requireAuth, tripController.createTrip);
router.post('/:id/start', requireAuth, tripController.startTrip);
router.post('/:id/pause', requireAuth, tripController.pauseTrip);
router.post('/:id/resume', requireAuth, tripController.resumeTrip);
router.post('/:id/complete', requireAuth, tripController.completeTrip);
router.post('/:id/cancel', requireAuth, tripController.cancelTrip);
router.post('/:id/stops/:stopId/status', requireAuth, tripController.updateStopStatus);

export default router;
