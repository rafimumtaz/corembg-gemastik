'use client';

import { useEffect, useRef } from 'react';

interface MapComponentProps {
  recipientLat?: number;
  recipientLng?: number;
  recipientName?: string;
  maxRadiusKm?: number;
  kitchenLat?: number;
  kitchenLng?: number;
  kitchenName?: string;
  distanceKm?: number;
  allKitchens?: any[];
  allRecipients?: any[];
}

export default function MapComponent({
  recipientLat,
  recipientLng,
  recipientName,
  maxRadiusKm = 5,
  kitchenLat,
  kitchenLng,
  kitchenName,
  distanceKm,
  allKitchens = [],
  allRecipients = [],
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Dynamically import Leaflet on client side
    import('leaflet').then((L) => {
      // Fix default Leaflet icon paths in React/Next
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Cleanup existing map instance
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }

      // Initial center
      const centerLat = recipientLat || kitchenLat || (allKitchens[0]?.latitude) || -6.2088;
      const centerLng = recipientLng || kitchenLng || (allKitchens[0]?.longitude) || 106.8456;

      const map = L.map(mapRef.current!).setView([centerLat, centerLng], 13);
      leafletInstance.current = map;

      // Dark Mode Tile Layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      const markersToFit: [number, number][] = [];

      // 1. Draw All Registered Dapur MBG (Pengirim) Locations
      if (allKitchens && allKitchens.length > 0) {
        allKitchens.forEach((k) => {
          if (!k.latitude || !k.longitude) return;
          const isSelected = kitchenLat === k.latitude && kitchenLng === k.longitude;

          const kIcon = L.divIcon({
            className: 'custom-kitchen-marker',
            html: `
              <div class="flex items-center justify-center h-9 w-9 rounded-full ${
                isSelected ? 'bg-blue-500 ring-4 ring-blue-500/40' : 'bg-blue-600'
              } text-white font-bold shadow-lg shadow-blue-600/50 border-2 border-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });

          L.marker([k.latitude, k.longitude], { icon: kIcon })
            .addTo(map)
            .bindPopup(`
              <div class="p-1 font-sans">
                <span class="text-xs font-semibold text-blue-600">Dapur MBG (Pengirim)</span>
                <h4 class="font-bold text-slate-900 text-sm">${k.name}</h4>
                <p class="text-xs text-slate-600">${k.address || ''}</p>
              </div>
            `);

          markersToFit.push([k.latitude, k.longitude]);
        });
      }

      // 2. Draw Specific Kitchen (if provided and not in allKitchens list)
      if (kitchenLat && kitchenLng && kitchenName && (!allKitchens || !allKitchens.some(k => k.latitude === kitchenLat && k.longitude === kitchenLng))) {
        const kIcon = L.divIcon({
          className: 'custom-kitchen-marker',
          html: `
            <div class="flex items-center justify-center h-9 w-9 rounded-full bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/50 border-2 border-white ring-4 ring-blue-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        L.marker([kitchenLat, kitchenLng], { icon: kIcon })
          .addTo(map)
          .bindPopup(`
            <div class="p-1 font-sans">
              <span class="text-xs font-semibold text-blue-600">Dapur MBG (Pengirim)</span>
              <h4 class="font-bold text-slate-900 text-sm">${kitchenName}</h4>
            </div>
          `);

        markersToFit.push([kitchenLat, kitchenLng]);
      }

      // 3. Draw Recipient Marker (if provided)
      if (recipientLat && recipientLng) {
        const recipientIcon = L.divIcon({
          className: 'custom-recipient-marker',
          html: `
            <div class="flex items-center justify-center h-9 w-9 rounded-full bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/50 border-2 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        L.marker([recipientLat, recipientLng], { icon: recipientIcon })
          .addTo(map)
          .bindPopup(`
            <div class="p-1 font-sans">
              <span class="text-xs font-semibold text-cyan-400">Penerima</span>
              <h4 class="font-bold text-slate-900 text-sm">${recipientName || 'Penerima'}</h4>
            </div>
          `);

        markersToFit.push([recipientLat, recipientLng]);

        // Radius Coverage Circle around Recipient
        L.circle([recipientLat, recipientLng], {
          color: '#06b6d4',
          fillColor: '#06b6d4',
          fillOpacity: 0.1,
          radius: maxRadiusKm * 1000,
          weight: 1.5,
          dashArray: '4, 8',
        }).addTo(map);
      }

      // 4. Draw Haversine Route Polyline (if both recipient and matched kitchen are present)
      if (recipientLat && recipientLng && kitchenLat && kitchenLng) {
        const polyline = L.polyline(
          [
            [recipientLat, recipientLng],
            [kitchenLat, kitchenLng],
          ],
          {
            color: '#3b82f6',
            weight: 3,
            opacity: 0.8,
            dashArray: '8, 8',
          }
        ).addTo(map);

        if (distanceKm) {
          polyline.bindTooltip(`Rute Haversine: ${distanceKm.toFixed(2)} KM`, {
            permanent: true,
            direction: 'center',
            className: 'distance-tooltip',
          });
        }
      }

      // Fit bounds if multiple markers exist
      if (markersToFit.length > 1) {
        const bounds = L.latLngBounds(markersToFit);
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, [recipientLat, recipientLng, recipientName, maxRadiusKm, kitchenLat, kitchenLng, kitchenName, distanceKm, allKitchens, allRecipients]);

  return <div ref={mapRef} className="w-full h-[380px] rounded-2xl overflow-hidden border border-slate-800 shadow-inner" />;
}
