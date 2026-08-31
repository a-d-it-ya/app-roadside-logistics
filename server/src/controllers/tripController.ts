import { Response } from 'express';
import { z } from 'zod';
import { tripService } from '../services/tripService';
import { AuthenticatedRequest } from '../middleware/auth';

const createTripStopSchema = z.object({
  hub_id: z.string().min(1),
  stop_order: z.number().int().nonnegative(),
  planned_arrival: z.string().optional(),
  planned_departure: z.string().optional(),
});

const createTripSchema = z.object({
  vehicle_id: z.string().min(1),
  driver_id: z.string().optional(),
  origin_hub_id: z.string().min(1),
  destination_hub_id: z.string().min(1),
  planned_start_time: z.string(),
  estimated_arrival: z.string().optional(),
  route_stops: z.array(createTripStopSchema).min(2),
});

export const tripController = {
  async listTrips(req: AuthenticatedRequest, res: Response) {
    try {
      const orgId = req.user?.organizationId;
      const status = req.query.status as string | undefined;
      const vehicleId = req.query.vehicle_id as string | undefined;
      const driverId = req.query.driver_id as string | undefined;
      const originHubId = req.query.origin_hub_id as string | undefined;
      const destinationHubId = req.query.destination_hub_id as string | undefined;

      const trips = await tripService.listTrips(orgId, {
        status,
        vehicleId,
        driverId,
        originHubId,
        destinationHubId,
      });

      res.status(200).json({
        success: true,
        count: trips.length,
        trips,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve trips' });
    }
  },

  async getTrip(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const orgId = req.user?.organizationId;

      const trip = await tripService.getTripById(id, orgId);
      if (!trip) {
        return res.status(404).json({ success: false, message: `Trip '${id}' not found.` });
      }

      res.status(200).json({
        success: true,
        trip,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch trip details' });
    }
  },

  async createTrip(req: AuthenticatedRequest, res: Response) {
    try {
      const orgId = req.user?.organizationId || (req.body.organization_id as string);
      if (!orgId) {
        return res.status(400).json({ success: false, message: 'Organization ID is required' });
      }

      const parsed = createTripSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid trip payload',
          errors: parsed.error.errors,
        });
      }

      const trip = await tripService.createTrip(orgId, {
        vehicleId: parsed.data.vehicle_id,
        driverId: parsed.data.driver_id,
        originHubId: parsed.data.origin_hub_id,
        destinationHubId: parsed.data.destination_hub_id,
        plannedStartTime: parsed.data.planned_start_time,
        estimatedArrival: parsed.data.estimated_arrival,
        routeStops: parsed.data.route_stops.map((s) => ({
          hubId: s.hub_id,
          stopOrder: s.stop_order,
          plannedArrival: s.planned_arrival,
          plannedDeparture: s.planned_departure,
        })),
      });

      res.status(201).json({
        success: true,
        message: 'Trip journey scheduled successfully.',
        trip,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to create trip' });
    }
  },

  async startTrip(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const orgId = req.user?.organizationId;

      const trip = await tripService.startTrip(id, orgId);
      res.status(200).json({
        success: true,
        message: 'Trip started. Vehicle and driver set to IN_PROGRESS.',
        trip,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to start trip' });
    }
  },

  async pauseTrip(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const orgId = req.user?.organizationId;

      await tripService.pauseTrip(id, orgId);
      res.status(200).json({ success: true, message: 'Trip journey paused.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to pause trip' });
    }
  },

  async resumeTrip(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const orgId = req.user?.organizationId;

      await tripService.resumeTrip(id, orgId);
      res.status(200).json({ success: true, message: 'Trip journey resumed.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to resume trip' });
    }
  },

  async completeTrip(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const orgId = req.user?.organizationId;

      const trip = await tripService.completeTrip(id, orgId);
      res.status(200).json({
        success: true,
        message: 'Trip completed. Vehicle and driver returned to AVAILABLE.',
        trip,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to complete trip' });
    }
  },

  async cancelTrip(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const orgId = req.user?.organizationId;

      await tripService.cancelTrip(id, orgId);
      res.status(200).json({ success: true, message: 'Trip journey cancelled.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to cancel trip' });
    }
  },

  async updateStopStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id: tripId, stopId } = req.params;
      const { status } = req.body;

      if (!status || !['UPCOMING', 'CURRENT', 'COMPLETED', 'SKIPPED'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Valid stop status required' });
      }

      const stop = await tripService.updateStopStatus(tripId, stopId, status);
      res.status(200).json({
        success: true,
        message: `Route stop updated to ${status}.`,
        stop,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update route stop status' });
    }
  },
};
