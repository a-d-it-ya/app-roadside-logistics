import { Router } from 'express';
import { telemetryController } from '../controllers/telemetryController';

const router = Router();

// Ingestion endpoints
router.post('/record', telemetryController.recordLocation);
router.post('/batch', telemetryController.recordBatch);

// Read endpoints
router.get('/latest', telemetryController.getLatest);
router.get('/vehicles/:vehicleId', telemetryController.getVehicleLocation);
router.get('/trips/:tripId/history', telemetryController.getTripHistory);

export default router;
