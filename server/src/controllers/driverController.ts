import { Response } from 'express';
import { z } from 'zod';
import { driverService } from '../services/driverService';
import { AuthenticatedRequest } from '../middleware/auth';

const createDriverSchema = z.object({
  full_name: z.string().min(2),
  phone: z.string().min(8),
  license_number: z.string().optional(),
  user_id: z.string().optional(),
});

const updateDriverSchema = z.object({
  full_name: z.string().optional(),
  phone: z.string().optional(),
  license_number: z.string().optional(),
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'OFFLINE', 'INACTIVE']).optional(),
});

const assignVehicleSchema = z.object({
  vehicle_id: z.string().min(1),
});

export const driverController = {
  async listDrivers(req: AuthenticatedRequest, res: Response) {
    try {
      const orgId = (req.query.organization_id as string) || req.user?.organizationId || 'org_demo';
      const status = req.query.status as string | undefined;
      const phone = req.query.phone as string | undefined;

      const drivers = await driverService.listDrivers(orgId, { status, phone });
      res.status(200).json({
        success: true,
        count: drivers.length,
        drivers,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve drivers' });
    }
  },

  async getDriver(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const orgId = (req.query.organization_id as string) || req.user?.organizationId;

      const driver = await driverService.getDriverById(id, orgId);
      if (!driver) {
        return res.status(404).json({ success: false, message: `Driver '${id}' not found.` });
      }

      res.status(200).json({
        success: true,
        driver,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch driver details' });
    }
  },

  async createDriver(req: AuthenticatedRequest, res: Response) {
    try {
      const orgId = req.user?.organizationId || (req.body.organization_id as string);
      if (!orgId) {
        return res.status(400).json({ success: false, message: 'Organization ID is required' });
      }

      const parsed = createDriverSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid driver payload',
          errors: parsed.error.errors,
        });
      }

      const driver = await driverService.createDriver(orgId, {
        fullName: parsed.data.full_name,
        phone: parsed.data.phone,
        licenseNumber: parsed.data.license_number,
        userId: parsed.data.user_id,
      });

      res.status(201).json({
        success: true,
        message: 'Driver onboarded successfully.',
        driver,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to onboard driver' });
    }
  },

  async updateDriver(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const orgId = req.user?.organizationId || (req.body.organization_id as string);
      if (!orgId) {
        return res.status(400).json({ success: false, message: 'Organization ID is required' });
      }

      const parsed = updateDriverSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid update payload',
          errors: parsed.error.errors,
        });
      }

      const updated = await driverService.updateDriver(id, orgId, {
        fullName: parsed.data.full_name,
        phone: parsed.data.phone,
        licenseNumber: parsed.data.license_number,
        status: parsed.data.status,
      });

      res.status(200).json({
        success: true,
        message: 'Driver profile updated.',
        driver: updated,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to update driver' });
    }
  },

  async assignVehicle(req: AuthenticatedRequest, res: Response) {
    try {
      const { id: driverId } = req.params;
      const orgId = req.user?.organizationId || (req.body.organization_id as string);
      if (!orgId) {
        return res.status(400).json({ success: false, message: 'Organization ID is required' });
      }

      const parsed = assignVehicleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'vehicle_id is required',
          errors: parsed.error.errors,
        });
      }

      const assignment = await driverService.assignVehicle(
        driverId,
        parsed.data.vehicle_id,
        orgId
      );

      res.status(200).json({
        success: true,
        message: 'Driver assigned to vehicle shift successfully.',
        assignment,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to assign vehicle' });
    }
  },

  async unassignVehicle(req: AuthenticatedRequest, res: Response) {
    try {
      const { id: driverId } = req.params;
      const orgId = req.user?.organizationId || (req.body.organization_id as string);
      if (!orgId) {
        return res.status(400).json({ success: false, message: 'Organization ID is required' });
      }

      await driverService.unassignVehicle(driverId, orgId);

      res.status(200).json({
        success: true,
        message: 'Driver unassigned from vehicle successfully.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to unassign vehicle' });
    }
  },

  async deleteDriver(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const orgId = req.user?.organizationId || (req.query.organization_id as string);
      if (!orgId) {
        return res.status(400).json({ success: false, message: 'Organization ID is required' });
      }

      await driverService.deleteDriver(id, orgId);

      res.status(200).json({
        success: true,
        message: 'Driver deactivated successfully.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to deactivate driver' });
    }
  },
};
