"use client";

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Station {
  id: string;
  name: string;
  latNum: number;
  lngNum: number;
}

interface MapProps {
  stations: Station[];
  activeStationId: string;
  onStationSelect: (id: string) => void;
}

export default function MapComponent({ stations, activeStationId, onStationSelect }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const activeStation = stations.find(s => s.id === activeStationId) || stations[0];
  const center: [number, number] = [activeStation.latNum, activeStation.lngNum];

  const createCustomIcon = (name: string, isActive: boolean) => {
    const bgColor = isActive ? '#0284c7' : '#ffffff';
    const textColor = isActive ? '#ffffff' : '#0f172a';
    const borderColor = isActive ? '#0284c7' : '#e2e8f0';
    const iconColor = isActive ? '#ffffff' : '#10b981'; 

    const html = `
      <div style="
        background-color: ${bgColor};
        color: ${textColor};
        border: 2px solid ${borderColor};
        border-radius: 20px;
        padding: 5px 12px 5px 6px;
        font-family: 'Outfit', sans-serif;
        font-weight: 600;
        font-size: 13px;
        white-space: nowrap;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 6px;
      ">
        <div style="
          background-color: ${isActive ? 'rgba(255,255,255,0.2)' : '#ecfdf5'};
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        ${name}
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-leaflet-marker',
      iconSize: [180, 36],
      iconAnchor: [90, 18], 
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map instance
    const map = L.map(mapRef.current).setView(center, 13);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">Carto</a>'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update map center when active station changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, 14, { animate: true });
    }
  }, [center]);

  // Update markers when stations or active station changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    stations.forEach(station => {
      const isActive = station.id === activeStationId;
      const marker = L.marker([station.latNum, station.lngNum], {
        icon: createCustomIcon(station.name, isActive)
      }).addTo(map);

      marker.bindPopup(`<b>${station.name}</b><br/>Live IoT Telemetry Station`);
      
      marker.on('click', () => {
        onStationSelect(station.id);
      });

      markersRef.current.push(marker);
    });
  }, [stations, activeStationId, onStationSelect]);

  return (
    <div 
      ref={mapRef} 
      style={{ height: '350px', width: '100%', borderRadius: '16px', zIndex: 1 }}
    />
  );
}
