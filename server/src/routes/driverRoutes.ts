import { Router } from 'express';
import { driverController } from '../controllers/driverController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', driverController.listDrivers);
router.get('/:id', driverController.getDriver);

// Protected mutation routes
router.post('/', requireAuth, driverController.createDriver);
router.put('/:id', requireAuth, driverController.updateDriver);
router.post('/:id/assign-vehicle', requireAuth, driverController.assignVehicle);
router.post('/:id/unassign-vehicle', requireAuth, driverController.unassignVehicle);
router.delete('/:id', requireAuth, driverController.deleteDriver);

export default router;
