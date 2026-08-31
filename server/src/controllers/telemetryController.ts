import { Request, Response } from 'express';
import { z } from 'zod';
import { telemetryService } from '../services/telemetryService';
import { AuthenticatedRequest } from '../middleware/auth';

const recordLocationSchema = z.object({
  vehicle_id: z.string().min(1),
  trip_id: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speed_km_h: z.number().nonnegative().optional(),
  heading: z.number().min(0).max(360).optional(),
  accuracy_meters: z.number().nonnegative().optional(),
  recorded_at: z.string().optional(),
  source: z.string().optional(),
});

const recordBatchSchema = z.object({
  locations: z.array(recordLocationSchema).min(1),
});

export const telemetryController = {
  async recordLocation(req: Request, res: Response) {
    try {
      const parsed = recordLocationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid telemetry payload',
          errors: parsed.error.errors,
        });
      }

      const result = await telemetryService.recordLocation({
        vehicleId: parsed.data.vehicle_id,
        tripId: parsed.data.trip_id,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        speedKmH: parsed.data.speed_km_h,
        heading: parsed.data.heading,
        accuracyMeters: parsed.data.accuracy_meters,
        recordedAt: parsed.data.recorded_at,
        source: parsed.data.source,
      });

      res.status(200).json({
        success: true,
        message: 'Telemetry point ingested successfully.',
        location: result,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to ingest telemetry' });
    }
  },

  async recordBatch(req: Request, res: Response) {
    try {
      const parsed = recordBatchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid batch payload',
          errors: parsed.error.errors,
        });
      }

      const points = parsed.data.locations.map((l) => ({
        vehicleId: l.vehicle_id,
        tripId: l.trip_id,
        latitude: l.latitude,
        longitude: l.longitude,
        speedKmH: l.speed_km_h,
        heading: l.heading,
        accuracyMeters: l.accuracy_meters,
        recordedAt: l.recorded_at,
        source: l.source,
      }));

      const count = await telemetryService.recordBatch(points);

      res.status(200).json({
        success: true,
        message: `Successfully ingested ${count} telemetry points.`,
        ingestedCount: count,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to ingest telemetry batch' });
    }
  },

  async getLatest(req: AuthenticatedRequest, res: Response) {
    try {
      const orgId = req.user?.organizationId || (req.query.organization_id as string);
      const locations = await telemetryService.getLatestLocations(orgId);

      res.status(200).json({
        success: true,
        count: locations.length,
        locations,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve live locations' });
    }
  },

  async getVehicleLocation(req: Request, res: Response) {
    try {
      const { vehicleId } = req.params;
      const data = await telemetryService.getVehicleLocation(vehicleId);

      res.status(200).json({
        success: true,
        vehicleId,
        ...data,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch vehicle location' });
    }
  },

  async getTripHistory(req: Request, res: Response) {
    try {
      const { tripId } = req.params;
      const history = await telemetryService.getTripHistory(tripId);

      res.status(200).json({
        success: true,
        tripId,
        count: history.length,
        history,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch trip history' });
    }
  },
};
