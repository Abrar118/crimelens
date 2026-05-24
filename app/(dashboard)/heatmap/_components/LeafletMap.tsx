"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapLocation {
  district: string;
  division: string;
  lat: number;
  lng: number;
  count: number;
}

function getColor(count: number, maxCount: number): string {
  const ratio = count / Math.max(maxCount, 1);
  if (ratio > 0.7) return "#dc2626";
  if (ratio > 0.4) return "#f97316";
  if (ratio > 0.2) return "#eab308";
  return "#22c55e";
}

function getRadius(count: number, maxCount: number): number {
  const ratio = count / Math.max(maxCount, 1);
  return Math.max(8, ratio * 30);
}

export default function LeafletMap({ locations }: { locations: MapLocation[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current).setView([23.685, 90.3563], 7);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const maxCount = Math.max(...locations.map((l) => l.count), 1);

    locations.forEach((loc) => {
      const color = getColor(loc.count, maxCount);
      const radius = getRadius(loc.count, maxCount);

      L.circleMarker([loc.lat, loc.lng], {
        radius,
        color,
        fillColor: color,
        fillOpacity: 0.6,
        weight: 2,
      })
        .bindPopup(
          `<div style="font-size:0.875rem">` +
            `<p style="font-weight:bold">${loc.district}</p>` +
            `<p style="color:#4b5563">${loc.division} Division</p>` +
            `<p style="font-weight:600">${loc.count} report${loc.count !== 1 ? "s" : ""}</p>` +
            `<a href="/crime-feed?division=${encodeURIComponent(loc.division)}&district=${encodeURIComponent(loc.district)}" ` +
            `style="color:#2563eb;text-decoration:underline;font-size:0.75rem">View reports</a>` +
            `</div>`
        )
        .addTo(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [locations]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}
