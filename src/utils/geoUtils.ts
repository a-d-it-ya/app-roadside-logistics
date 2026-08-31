import { Coordinates } from '../types/logistics';

export function calculateBearing(start: Coordinates, end: Coordinates): number {
  const startLat = (start.lat * Math.PI) / 180;
  const startLng = (start.lng * Math.PI) / 180;
  const endLat = (end.lat * Math.PI) / 180;
  const endLng = (end.lng * Math.PI) / 180;

  const dLng = endLng - startLng;

  const y = Math.sin(dLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

export function interpolateCoordinates(
  polyline: [number, number][],
  progress: number // 0 to 1
): { coords: Coordinates; heading: number } {
  if (!polyline || polyline.length < 2) {
    return {
      coords: { lat: 20.5937, lng: 78.9629 },
      heading: 0
    };
  }

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const totalSegments = polyline.length - 1;
  const rawIndex = clampedProgress * totalSegments;
  const segmentIndex = Math.min(Math.floor(rawIndex), totalSegments - 1);
  const segmentProgress = rawIndex - segmentIndex;

  const start = polyline[segmentIndex];
  const end = polyline[segmentIndex + 1];

  const lat = start[0] + (end[0] - start[0]) * segmentProgress;
  const lng = start[1] + (end[1] - start[1]) * segmentProgress;

  const startCoord: Coordinates = { lat: start[0], lng: start[1] };
  const endCoord: Coordinates = { lat: end[0], lng: end[1] };
  const heading = calculateBearing(startCoord, endCoord);

  return {
    coords: { lat, lng },
    heading
  };
}

export const CITY_COORDINATES: Record<string, Coordinates> = {
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'vijayawada': { lat: 16.5062, lng: 80.6480 },
  'bhubaneswar': { lat: 20.2961, lng: 85.8245 },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'delhi ncr': { lat: 28.6139, lng: 77.2090 },
  'kolkata': { lat: 22.5726, lng: 88.3639 }
};

export function getCityCoordinates(cityName: string): Coordinates {
  const key = (cityName || '').toLowerCase().trim();
  if (CITY_COORDINATES[key]) return CITY_COORDINATES[key];
  for (const [k, v] of Object.entries(CITY_COORDINATES)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return { lat: 17.3850, lng: 78.4867 };
}

/**
 * Calculates Haversine distance between two coordinates in kilometers
 */
export function calculateHaversineDistanceKm(p1: Coordinates, p2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Calculates distance from a point to a line segment in km
 */
export function calculatePointToSegmentDistanceKm(
  point: Coordinates,
  segStart: Coordinates,
  segEnd: Coordinates
): number {
  const dX = segEnd.lng - segStart.lng;
  const dY = segEnd.lat - segStart.lat;
  const lenSq = dX * dX + dY * dY;

  if (lenSq === 0) return calculateHaversineDistanceKm(point, segStart);

  let t = ((point.lng - segStart.lng) * dX + (point.lat - segStart.lat) * dY) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projCoord: Coordinates = {
    lat: segStart.lat + t * dY,
    lng: segStart.lng + t * dX
  };

  return calculateHaversineDistanceKm(point, projCoord);
}

/**
 * Estimates shortest detour from a hub to a highway polyline in km
 */
export function calculateMinDetourToPolylineKm(
  hubCoord: Coordinates,
  polyline: [number, number][]
): number {
  if (!polyline || polyline.length < 2) return 5.0;

  let minDistance = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const segStart: Coordinates = { lat: polyline[i][0], lng: polyline[i][1] };
    const segEnd: Coordinates = { lat: polyline[i + 1][0], lng: polyline[i + 1][1] };
    const dist = calculatePointToSegmentDistanceKm(hubCoord, segStart, segEnd);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }

  // Realistic highway access detour multiplier (exit ramp + local access road)
  return Number((Math.max(1.2, minDistance * 1.35)).toFixed(1));
}
