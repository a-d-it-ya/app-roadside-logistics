import { Request, Response } from 'express';
import { z } from 'zod';
import { hubService } from '../services/hubService';

const nearbyQuerySchema = z.object({
  lat: z.string().transform((v) => parseFloat(v)),
  lng: z.string().transform((v) => parseFloat(v)),
  radius_km: z.string().optional().transform((v) => (v ? parseFloat(v) : 35)),
  cargo_type: z.string().optional(),
});

export const hubController = {
  async listHubs(req: Request, res: Response) {
    try {
      const city = req.query.city as string | undefined;
      const hubType = req.query.hub_type as string | undefined;
      const cargoType = req.query.cargo_type as string | undefined;

      const hubs = await hubService.listHubs({ city, hubType, cargoType });
      res.status(200).json({
        success: true,
        count: hubs.length,
        hubs,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve logistics hubs' });
    }
  },

  async getHub(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const hub = await hubService.getHubById(id);

      if (!hub) {
        return res.status(404).json({ success: false, message: `Hub with identifier '${id}' not found.` });
      }

      res.status(200).json({
        success: true,
        hub,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch hub details' });
    }
  },

  async findNearby(req: Request, res: Response) {
    try {
      const parsed = nearbyQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinate parameters. Provide lat and lng.',
          errors: parsed.error.errors,
        });
      }

      const { lat, lng, radius_km, cargo_type } = parsed.data;
      const nearby = await hubService.findNearbyHubs(lat, lng, radius_km, cargo_type);

      res.status(200).json({
        success: true,
        center: { lat, lng, radiusKm: radius_km },
        count: nearby.length,
        results: nearby,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to perform spatial hub search' });
    }
  },

  async createHub(req: Request, res: Response) {
    try {
      const hub = await hubService.createHub(req.body);
      res.status(201).json({
        success: true,
        message: 'Logistics hub registered successfully.',
        hub,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to register hub' });
    }
  },
};
