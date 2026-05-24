"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

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
  const maxCount = Math.max(...locations.map((l) => l.count), 1);

  return (
    <MapContainer
      center={[23.685, 90.3563]}
      zoom={7}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {locations.map((loc) => (
        <CircleMarker
          key={`${loc.district}-${loc.division}`}
          center={[loc.lat, loc.lng]}
          radius={getRadius(loc.count, maxCount)}
          pathOptions={{
            color: getColor(loc.count, maxCount),
            fillColor: getColor(loc.count, maxCount),
            fillOpacity: 0.6,
            weight: 2,
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{loc.district}</p>
              <p className="text-gray-600">{loc.division} Division</p>
              <p className="font-semibold">{loc.count} report{loc.count !== 1 ? "s" : ""}</p>
              <Link
                href={`/crime-feed?division=${encodeURIComponent(loc.division)}&district=${encodeURIComponent(loc.district)}`}
                className="text-blue-600 underline text-xs"
              >
                View reports
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
