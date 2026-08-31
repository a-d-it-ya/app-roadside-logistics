import { Request, Response } from 'express';
import { z } from 'zod';
import { matchingService } from '../services/matchingService';

const searchVehiclesSchema = z.object({
  origin: z.string().min(2),
  destination: z.string().min(2),
  cargo_weight_kg: z.number().positive().default(500),
  cargo_type: z.string().default('General Cargo'),
  booking_mode: z.enum(['SHARED_CAPACITY', 'FULL_VEHICLE']).default('SHARED_CAPACITY'),
});

export const matchingController = {
  async findVehicles(req: Request, res: Response) {
    try {
      const parsed = searchVehiclesSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid search parameters',
          errors: parsed.error.errors,
        });
      }

      const matches = await matchingService.findMatchingVehicles({
        origin: parsed.data.origin,
        destination: parsed.data.destination,
        cargoWeightKg: parsed.data.cargo_weight_kg,
        cargoType: parsed.data.cargo_type,
        bookingMode: parsed.data.booking_mode,
      });

      res.status(200).json({
        success: true,
        searchQuery: parsed.data,
        count: matches.length,
        matches,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Matching search failed' });
    }
  },

  async evaluateVehicle(req: Request, res: Response) {
    try {
      const { vehicleId } = req.params;
      const parsed = searchVehiclesSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid search parameters',
          errors: parsed.error.errors,
        });
      }

      const evaluation = await matchingService.evaluateVehicleSuitability(vehicleId, {
        origin: parsed.data.origin,
        destination: parsed.data.destination,
        cargoWeightKg: parsed.data.cargo_weight_kg,
        cargoType: parsed.data.cargo_type,
        bookingMode: parsed.data.booking_mode,
      });

      if (!evaluation) {
        return res.status(404).json({
          success: false,
          message: `Vehicle '${vehicleId}' is not compatible with the requested route/cargo parameters.`,
        });
      }

      res.status(200).json({
        success: true,
        evaluation,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Evaluation failed' });
    }
  },
};
