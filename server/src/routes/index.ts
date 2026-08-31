import { Router } from 'express';
import authRoutes from './authRoutes';
import orgRoutes from './orgRoutes';
import hubRoutes from './hubRoutes';
import vehicleRoutes from './vehicleRoutes';
import driverRoutes from './driverRoutes';
import tripRoutes from './tripRoutes';
import telemetryRoutes from './telemetryRoutes';
import matchingRoutes from './matchingRoutes';
import bookingRoutes from './bookingRoutes';
import trackingRoutes from './trackingRoutes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'roadside-logistics-server',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    capabilities: [
      'multi-tenant-auth',
      'geographic-hub-service',
      'fleet-vehicle-management',
      'driver-shift-assignments',
      'trip-journey-lifecycle',
      'real-time-telemetry-ingestion',
      'corridor-matching-engine',
      'atomic-booking-settlement',
      'real-time-milestone-tracking'
    ]
  });
});

router.use('/auth', authRoutes);
router.use('/organizations', orgRoutes);
router.use('/hubs', hubRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/trips', tripRoutes);
router.use('/telemetry', telemetryRoutes);
router.use('/matching', matchingRoutes);
router.use('/bookings', bookingRoutes);
router.use('/tracking', trackingRoutes);

export default router;
