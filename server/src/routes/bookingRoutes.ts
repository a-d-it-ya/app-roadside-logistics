import { Router } from 'express';
import { bookingController } from '../controllers/bookingController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public quote endpoint
router.post('/quote', bookingController.quote);

// Authenticated booking endpoints
router.post('/create', requireAuth, bookingController.createBooking);
router.get('/', requireAuth, bookingController.listBookings);
router.get('/:id', requireAuth, bookingController.getBooking);
router.post('/:id/cancel', requireAuth, bookingController.cancelBooking);

export default router;
