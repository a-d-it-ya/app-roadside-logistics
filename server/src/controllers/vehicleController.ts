import { Response } from 'express';
import { z } from 'zod';
import { vehicleService } from '../services/vehicleService';
import { AuthenticatedRequest } from '../middleware/auth';

const createVehicleSchema = z.object({
  registration_number: z.string().min(4),
  vehicle_class: z.string().min(2),
  vehicle_type: z.string().min(2),
  total_capacity_kg: z.number().positive(),
  supported_cargo_types: z.array(z.string()).min(1),
});

const updateVehicleSchema = z.object({
  vehicle_class: z.string().optional(),
  vehicle_type: z.string().optional(),
  total_capacity_kg: z.number().positive().optional(),
  supported_cargo_types: z.array(z.string()).optional(),
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'MAINTENANCE', 'INACTIVE']).optional(),
});

export const vehicleController = {
  async listVehicles(req: AuthenticatedRequest, res: Response) {
    try {
      const orgId = (req.query.organization_id as string) || req.user?.organizationId || 'org_demo';
      const status = req.query.status as string | undefined;
      const vehicleType = req.query.vehicle_type as string | undefined;
      const cargoType = req.query.cargo_type as string | undefined;

      const vehicles = await vehicleService.listVehicles(orgId, {
        status,
        vehicleType,
        cargoType,
      });

      res.status(200).json({
        success: true,
        count: vehicles.length,
        vehicles,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve vehicles' });
    }
  },

  async getVehicle(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const orgId = (req.query.organization_id as string) || req.user?.organizationId;

      const vehicle = await vehicleService.getVehicleById(id, orgId);

      if (!vehicle) {
        return res.status(404).json({ success: false, message: `Vehicle '${id}' not found.` });
      }

      res.status(200).json({
        success: true,
        vehicle,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch vehicle' });
    }
  },

  async createVehicle(req: AuthenticatedRequest, res: Response) {
    try {
      const orgId = req.user?.organizationId || (req.body.organization_id as string);
      if (!orgId) {
        return res.status(400).json({ success: false, message: 'Organization ID is required' });
      }

      const parsed = createVehicleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid vehicle payload',
          errors: parsed.error.errors,
        });
      }

      const vehicle = await vehicleService.createVehicle(orgId, {
        registrationNumber: parsed.data.registration_number,
        vehicleClass: parsed.data.vehicle_class,
        vehicleType: parsed.data.vehicle_type,
        totalCapacityKg: parsed.data.total_capacity_kg,
        supportedCargoTypes: parsed.data.supported_cargo_types,
      });

      res.status(201).json({
        success: true,
        message: 'Vehicle onboarded successfully.',
        vehicle,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to onboard vehicle' });
    }
  },

  async updateVehicle(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const orgId = req.user?.organizationId || (req.body.organization_id as string);
      if (!orgId) {
        return res.status(400).json({ success: false, message: 'Organization ID is required' });
      }

      const parsed = updateVehicleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid update payload',
          errors: parsed.error.errors,
        });
      }

      const updated = await vehicleService.updateVehicle(id, orgId, {
        vehicleClass: parsed.data.vehicle_class,
        vehicleType: parsed.data.vehicle_type,
        totalCapacityKg: parsed.data.total_capacity_kg,
        supportedCargoTypes: parsed.data.supported_cargo_types,
        status: parsed.data.status,
      });

      res.status(200).json({
        success: true,
        message: 'Vehicle parameters updated successfully.',
        vehicle: updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to update vehicle' });
    }
  },

  async deleteVehicle(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const orgId = req.user?.organizationId || (req.query.organization_id as string);
      if (!orgId) {
        return res.status(400).json({ success: false, message: 'Organization ID is required' });
      }

      await vehicleService.deleteVehicle(id, orgId);

      res.status(200).json({
        success: true,
        message: 'Vehicle decommissioned successfully.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to decommission vehicle' });
    }
  },
};
