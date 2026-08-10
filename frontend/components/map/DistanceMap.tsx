'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface DistanceMapProps {
  recipientLat: number;
  recipientLng: number;
  recipientName: string;
  kitchenLat?: number;
  kitchenLng?: number;
  kitchenName?: string;
  radiusKm?: number;
  distanceKm?: number;
  travelTimeMinutes?: number;
}

export const DistanceMap: React.FC<DistanceMapProps> = ({
  recipientLat,
  recipientLng,
  recipientName,
  kitchenLat,
  kitchenLng,
  kitchenName,
  radiusKm = 5,
  distanceKm,
  travelTimeMinutes,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Dynamically import Leaflet to avoid SSR window errors
    import('leaflet').then((L) => {
      // Fix default marker icon paths in Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const hasKitchen = kitchenLat !== undefined && kitchenLng !== undefined;

      const centerLat = hasKitchen ? (recipientLat + kitchenLat!) / 2 : recipientLat;
      const centerLng = hasKitchen ? (recipientLng + kitchenLng!) / 2 : recipientLng;

      const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], hasKitchen ? 13 : 14);
      mapInstanceRef.current = map;

      // Add OpenStreetMap tile layer with crisp modern styling
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      }).addTo(map);

      // Custom Recipient Marker Icon (Green/Cyan)
      const recipientIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
          <div style="background-color: #0284c7; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 10px rgba(2,132,199,0.4); font-size: 16px;">
            🏠
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      // Recipient Marker
      L.marker([recipientLat, recipientLng], { icon: recipientIcon })
        .addTo(map)
        .bindPopup(`<b>${recipientName}</b><br/>Penerima Makanan`)
        .openPopup();

      // Coverage Radius Circle around Recipient
      L.circle([recipientLat, recipientLng], {
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        radius: radiusKm * 1000,
        dashArray: '5, 10',
      }).addTo(map);

      // If Kitchen is present, add Kitchen marker & Polyline route
      if (hasKitchen) {
        const kitchenIcon = L.divIcon({
          className: 'custom-leaflet-icon',
          html: `
            <div style="background-color: #2563eb; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 10px rgba(37,99,235,0.4); font-size: 16px;">
              🍳
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        L.marker([kitchenLat!, kitchenLng!], { icon: kitchenIcon })
          .addTo(map)
          .bindPopup(`<b>${kitchenName || 'Dapur MBG'}</b><br/>Pengirim Makanan`);

        // Draw Polyline connecting Kitchen and Recipient
        const latlngs: [number, number][] = [
          [kitchenLat!, kitchenLng!],
          [recipientLat, recipientLng],
        ];

        const polyline = L.polyline(latlngs, {
          color: '#2563eb',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8',
        }).addTo(map);

        // Midpoint Popup for Haversine Distance
        const distText = distanceKm ? `${distanceKm.toFixed(2)} KM` : 'Haversine Route';
        const timeText = travelTimeMinutes ? ` (~${travelTimeMinutes} menit)` : '';

        polyline.bindTooltip(
          `<div style="font-weight: bold; font-family: sans-serif; color: #1e3a8a;">
            📏 Jarak: ${distText}${timeText}
           </div>`,
          { permanent: true, direction: 'center', className: 'distance-tooltip' }
        );

        // Fit bounds to encompass both markers comfortably
        const bounds = L.latLngBounds(latlngs);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [recipientLat, recipientLng, recipientName, kitchenLat, kitchenLng, kitchenName, radiusKm, distanceKm, travelTimeMinutes]);

  return (
    <div className="relative w-full h-full min-h-[360px] rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <div ref={mapContainerRef} className="w-full h-full min-h-[360px]" />
    </div>
  );
};
