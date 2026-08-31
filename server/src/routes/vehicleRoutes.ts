import { Router } from 'express';
import { vehicleController } from '../controllers/vehicleController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', vehicleController.listVehicles);
router.get('/:id', vehicleController.getVehicle);

// Protected mutation routes
router.post('/', requireAuth, vehicleController.createVehicle);
router.put('/:id', requireAuth, vehicleController.updateVehicle);
router.delete('/:id', requireAuth, vehicleController.deleteVehicle);

export default router;
