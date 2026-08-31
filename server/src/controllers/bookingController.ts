import { Request, Response } from 'express';
import { z } from 'zod';
import { bookingService } from '../services/bookingService';
import { AuthenticatedRequest } from '../middleware/auth';

const createBookingSchema = z.object({
  trip_id: z.string().min(1),
  vehicle_id: z.string().min(1),
  origin: z.string().min(2),
  destination: z.string().min(2),
  cargo_weight_kg: z.number().positive(),
  cargo_type: z.string().min(1),
  booking_mode: z.enum(['SHARED_CAPACITY', 'FULL_VEHICLE']).default('SHARED_CAPACITY'),
  pickup_hub_id: z.string().optional(),
  delivery_hub_id: z.string().optional(),
});

const quoteSchema = z.object({
  origin_lat: z.number(),
  origin_lng: z.number(),
  dest_lat: z.number(),
  dest_lng: z.number(),
  cargo_weight_kg: z.number().positive(),
  cargo_type: z.string().optional(),
  booking_mode: z.enum(['SHARED_CAPACITY', 'FULL_VEHICLE']).default('SHARED_CAPACITY'),
});

export const bookingController = {
  async quote(req: Request, res: Response) {
    try {
      const parsed = quoteSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid quote parameters',
          errors: parsed.error.errors,
        });
      }

      const quote = bookingService.calculatePriceQuote({
        originLat: parsed.data.origin_lat,
        originLng: parsed.data.origin_lng,
        destLat: parsed.data.dest_lat,
        destLng: parsed.data.dest_lng,
        cargoWeightKg: parsed.data.cargo_weight_kg,
        cargoType: parsed.data.cargo_type,
        bookingMode: parsed.data.booking_mode,
      });

      res.status(200).json({
        success: true,
        quote,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to calculate quote' });
    }
  },

  async createBooking(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId || 'usr_demo';
      const orgId = req.user?.organizationId || 'org_demo';

      const parsed = createBookingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid booking payload',
          errors: parsed.error.errors,
        });
      }

      const result = await bookingService.createBooking({
        userId,
        organizationId: orgId,
        tripId: parsed.data.trip_id,
        vehicleId: parsed.data.vehicle_id,
        origin: parsed.data.origin,
        destination: parsed.data.destination,
        cargoWeightKg: parsed.data.cargo_weight_kg,
        cargoType: parsed.data.cargo_type,
        bookingMode: parsed.data.booking_mode,
        pickupHubId: parsed.data.pickup_hub_id,
        deliveryHubId: parsed.data.delivery_hub_id,
      });

      res.status(201).json({
        success: true,
        message: 'Cargo booking & capacity reservation confirmed.',
        ...result,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to create booking' });
    }
  },

  async listBookings(req: AuthenticatedRequest, res: Response) {
    try {
      const orgId = req.user?.organizationId;
      const userId = req.user?.userId;

      const bookings = await bookingService.listBookings(orgId, userId);
      res.status(200).json({
        success: true,
        count: bookings.length,
        bookings,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }
  },

  async getBooking(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const booking = await bookingService.getBookingById(id);

      if (!booking) {
        return res.status(404).json({ success: false, message: `Booking '${id}' not found.` });
      }

      res.status(200).json({
        success: true,
        booking,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch booking details' });
    }
  },

  async cancelBooking(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const result = await bookingService.cancelBooking(id, reason);
      res.status(200).json({
        success: true,
        message: 'Booking cancelled. Reserved payload capacity restored to trip.',
        result,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to cancel booking' });
    }
  },
};
