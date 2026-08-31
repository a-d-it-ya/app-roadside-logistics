import { Router } from 'express';
import { matchingController } from '../controllers/matchingController';

const router = Router();

router.post('/find-vehicles', matchingController.findVehicles);
router.post('/evaluate-vehicle/:vehicleId', matchingController.evaluateVehicle);

export default router;
