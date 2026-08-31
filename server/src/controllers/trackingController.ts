import { Request, Response } from 'express';
import { z } from 'zod';
import { trackingService } from '../services/trackingService';

const recordEventSchema = z.object({
  event_type: z.enum([
    'BOOKING_CONFIRMED',
    'CARGO_READY',
    'TRUCK_APPROACHING',
    'LOADING_WINDOW_OPEN',
    'LOADING_STARTED',
    'LOADED',
    'DEPARTED',
    'IN_TRANSIT',
    'ARRIVED',
    'DELIVERED',
    'PICKUP_MISSED',
  ]),
  title: z.string().min(2),
  description: z.string().min(2),
  location: z.string().optional(),
});

export const trackingController = {
  async getShipmentTracking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tracking = await trackingService.getShipmentTracking(id);

      if (!tracking) {
        return res.status(404).json({ success: false, message: `Shipment '${id}' not found.` });
      }

      res.status(200).json({
        success: true,
        tracking,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve shipment tracking' });
    }
  },

  async recordEvent(req: Request, res: Response) {
    try {
      const { id: shipmentId } = req.params;
      const parsed = recordEventSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid tracking event payload',
          errors: parsed.error.errors,
        });
      }

      const event = await trackingService.recordMilestoneEvent({
        shipmentId,
        eventType: parsed.data.event_type,
        title: parsed.data.title,
        description: parsed.data.description,
        location: parsed.data.location,
      });

      res.status(201).json({
        success: true,
        message: `Milestone event '${parsed.data.event_type}' recorded successfully.`,
        event,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Failed to record milestone event' });
    }
  },

  async getTimeline(req: Request, res: Response) {
    try {
      const { id: shipmentId } = req.params;
      const timeline = await trackingService.getMilestoneTimeline(shipmentId);

      res.status(200).json({
        success: true,
        shipmentId,
        count: timeline.length,
        timeline,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve milestone timeline' });
    }
  },
};
