import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, LogisticsHub } from '../../types/logistics';
import { FREIGHT_CORRIDORS } from '../../data/freightCorridors';

interface FreightNetworkMapProps {
  trucks: Truck[];
  hubs: LogisticsHub[];
  selectedTruck: Truck | null;
  selectedHub: LogisticsHub | null;
  onSelectTruck: (truck: Truck) => void;
  onSelectHub: (hub: LogisticsHub) => void;
}

export const FreightNetworkMap: React.FC<FreightNetworkMapProps> = ({
  trucks,
  hubs,
  selectedTruck,
  selectedHub,
  onSelectTruck,
  onSelectHub
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const corridorsGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered on India
    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dark theme CartoDB basemap
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 19,
        subdomains: 'abcd'
      }
    ).addTo(map);

    markersGroupRef.current = L.layerGroup().addTo(map);
    corridorsGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render Corridors
  useEffect(() => {
    const map = mapInstanceRef.current;
    const corridorsGroup = corridorsGroupRef.current;
    if (!map || !corridorsGroup) return;

    corridorsGroup.clearLayers();

    FREIGHT_CORRIDORS.forEach((corr) => {
      L.polyline(corr.coordinates, {
        color: corr.color,
        weight: 4,
        opacity: 0.75,
        dashArray: '8, 6',
        lineCap: 'round'
      })
        .bindTooltip(`<b>${corr.name}</b>`, { sticky: true, className: 'custom-tooltip' })
        .addTo(corridorsGroup);
    });
  }, []);

  // Render Hubs and Trucks
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // Render Hubs
    hubs.forEach((hub) => {
      const isSelected = selectedHub?.id === hub.id;
      const hubIcon = L.divIcon({
        className: 'custom-hub-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            gap: 4px;
            background: ${isSelected ? '#059669' : '#022c22'};
            border: 2px solid ${isSelected ? '#34d399' : '#10b981'};
            border-radius: 9999px;
            padding: 3px 8px;
            box-shadow: 0 0 12px rgba(16, 185, 129, 0.45);
            color: white;
            font-family: monospace;
            font-size: 10px;
            font-weight: bold;
            cursor: pointer;
            white-space: nowrap;
            transform: translate(-50%, -50%);
          ">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: #34d399;"></span>
            <span>${hub.name.split(' ')[0]}</span>
          </div>
        `,
        iconSize: [0, 0]
      });

      const marker = L.marker([hub.coordinates.lat, hub.coordinates.lng], { icon: hubIcon });
      marker.on('click', () => onSelectHub(hub));
      marker.addTo(markersGroup);
    });

    // Render Trucks
    trucks.forEach((truck) => {
      const lat = truck.currentCoords?.lat || truck.currentLocation?.latitude || 20.0;
      const lng = truck.currentCoords?.lng || truck.currentLocation?.longitude || 78.0;
      const isSelected = selectedTruck?.id === truck.id;

      const truckIcon = L.divIcon({
        className: 'custom-truck-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            gap: 5px;
            background: ${isSelected ? '#0369a1' : '#082f49'};
            border: 2px solid ${isSelected ? '#38bdf8' : '#0ea5e9'};
            border-radius: 12px;
            padding: 4px 8px;
            box-shadow: 0 0 14px rgba(14, 165, 233, 0.5);
            color: white;
            font-family: monospace;
            font-size: 10px;
            font-weight: 800;
            cursor: pointer;
            white-space: nowrap;
            transform: translate(-50%, -50%);
          ">
            <span style="font-size: 12px;">🚚</span>
            <span>${truck.id}</span>
            <span style="color: #38bdf8; font-size: 9px;">(${(truck.availableCapacityKg / 1000).toFixed(1)}T)</span>
          </div>
        `,
        iconSize: [0, 0]
      });

      const marker = L.marker([lat, lng], { icon: truckIcon });
      marker.on('click', () => onSelectTruck(truck));
      marker.addTo(markersGroup);
    });
  }, [trucks, hubs, selectedTruck, selectedHub, onSelectTruck, onSelectHub]);

  // Pan to selected item
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedTruck) {
      const lat = selectedTruck.currentCoords?.lat || selectedTruck.currentLocation?.latitude;
      const lng = selectedTruck.currentCoords?.lng || selectedTruck.currentLocation?.longitude;
      if (lat && lng) {
        map.flyTo([lat, lng], 8, { duration: 1.2 });
      }
    } else if (selectedHub) {
      map.flyTo([selectedHub.coordinates.lat, selectedHub.coordinates.lng], 8, { duration: 1.2 });
    }
  }, [selectedTruck, selectedHub]);

  return (
    <div
      ref={mapContainerRef}
      className="absolute inset-0 w-full h-full z-0 bg-slate-950"
      style={{ zIndex: 0 }}
    />
  );
};
