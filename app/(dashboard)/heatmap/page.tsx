"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, MapPin } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import the map to avoid SSR issues with leaflet
const LeafletMap = dynamic(() => import("./_components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-lg overflow-hidden flex items-center justify-center bg-gray-800 text-gray-400">
      Loading map...
    </div>
  ),
});

// Dummy Crime Data
const crimeReports = [
  {
    id: 1,
    title: "Robbery",
    severity: "high",
    lat: 23.8103,
    lon: 90.4125,
    location: "Dhaka, Bangladesh",
  },
  {
    id: 2,
    title: "Cyber Fraud",
    severity: "medium",
    lat: 22.3569,
    lon: 91.7832,
    location: "Chattogram, Bangladesh",
  },
  {
    id: 3,
    title: "Street Theft",
    severity: "low",
    lat: 24.3636,
    lon: 88.6241,
    location: "Rajshahi, Bangladesh",
  },
];

const Heatmap: React.FC = () => {
  const [crimeData, setCrimeData] = useState(crimeReports);
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch User Location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(
          `Your Location: ${pos.coords.latitude}, ${pos.coords.longitude}`
        );
      },
      () => {
        setLocation("Location not available");
      }
    );
  }, []);

  // Function to fetch real-time crime data (Replace with API call)
  const fetchCrimeData = async () => {
    setLoading(true);
    setTimeout(() => {
      toast.success("Crime data updated!");
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <Card className="border border-gray-700">
          <CardHeader>
            <CardTitle className="text-primary text-xl md:text-2xl flex items-center">
              <MapPin className="mr-2" size={28} /> Crime Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Location Display */}
            <div className="bg-gray-800 text-yellow-400 p-3 rounded-lg flex items-center mb-4">
              <AlertCircle className="mr-2" size={20} />
              <span>{location}</span>
            </div>

            {/* Refresh Button */}
            <Button
              className="mb-4"
              onClick={fetchCrimeData}
              disabled={loading}
            >
              <RefreshCw className="mr-2" size={16} />{" "}
              {loading ? "Updating..." : "Refresh Data"}
            </Button>

            {/* Crime Heatmap */}
            <div className="w-full h-[500px] rounded-lg overflow-hidden">
              <LeafletMap crimeData={crimeData} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Heatmap;
