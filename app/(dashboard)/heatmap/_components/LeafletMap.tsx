"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const crimeIcons = {
  low: new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2913/2913136.png",
    iconSize: [30, 30],
  }),
  medium: new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
    iconSize: [30, 30],
  }),
  high: new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3063/3063077.png",
    iconSize: [35, 35],
  }),
};

interface CrimePoint {
  id: number;
  title: string;
  severity: string;
  lat: number;
  lon: number;
  location: string;
}

export default function LeafletMap({ crimeData }: { crimeData: CrimePoint[] }) {
  return (
    <MapContainer
      center={[23.8103, 90.4125]}
      zoom={7}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {crimeData.map((crime) => (
        <Marker
          key={crime.id}
          position={[crime.lat, crime.lon]}
          icon={crimeIcons[crime.severity as keyof typeof crimeIcons]}
        >
          <Popup>
            <strong>{crime.title}</strong>
            <p>{crime.location}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
