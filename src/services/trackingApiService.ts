import { apiRequest } from './apiClient';

export const trackingApiService = {
  /**
   * Fetch live shipment tracking status
   */
  async getShipmentTracking(shipmentId: string) {
    try {
      const res = await apiRequest<{ success: boolean; tracking: any }>(
        `/tracking/shipments/${shipmentId}`
      );
      if (res && res.success && res.tracking) {
        return res.tracking;
      }
    } catch (err) {
      // fallback
    }
    return null;
  },

  /**
   * Record a shipment milestone event
   */
  async recordEvent(
    shipmentId: string,
    event: {
      eventType: string;
      title: string;
      description: string;
      location?: string;
    }
  ) {
    try {
      const res = await apiRequest<{ success: boolean; event: any }>(
        `/tracking/shipments/${shipmentId}/events`,
        {
          method: 'POST',
          body: JSON.stringify({
            event_type: event.eventType,
            title: event.title,
            description: event.description,
            location: event.location,
          }),
        }
      );
      if (res && res.success) {
        return res.event;
      }
    } catch (err) {
      // fallback
    }
    return null;
  },

  /**
   * Get milestone event timeline
   */
  async getTimeline(shipmentId: string) {
    try {
      const res = await apiRequest<{ success: boolean; timeline: any[] }>(
        `/tracking/shipments/${shipmentId}/timeline`
      );
      if (res && res.success && Array.isArray(res.timeline)) {
        return res.timeline;
      }
    } catch (err) {
      // fallback
    }
    return [];
  },
};
