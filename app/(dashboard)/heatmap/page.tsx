"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";
import { getPostLocations } from "@/lib/api/posts";
import dynamic from "next/dynamic";
import districtsData from "@/lib/data/districts.json";

const LeafletMap = dynamic(() => import("./_components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-lg overflow-hidden flex items-center justify-center bg-muted text-muted-foreground">
      Loading map...
    </div>
  ),
});

interface LocationData {
  district: string;
  division: string;
  count: number;
}

interface MapLocation {
  district: string;
  division: string;
  lat: number;
  lng: number;
  count: number;
}

const districts = (districtsData as any)[2]?.data || [];

function mapToCoordinates(locations: LocationData[]): MapLocation[] {
  return locations
    .map((loc) => {
      const district = districts.find(
        (d: any) => d.name.toLowerCase() === loc.district.toLowerCase()
      );
      if (!district) return null;
      return {
        district: loc.district,
        division: loc.division,
        lat: parseFloat(district.lat),
        lng: parseFloat(district.lon),
        count: loc.count,
      };
    })
    .filter(Boolean) as MapLocation[];
}

export default function HeatmapPage() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalReports, setTotalReports] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const data: LocationData[] = await getPostLocations();
        const mapped = mapToCoordinates(data);
        setLocations(mapped);
        setTotalReports(data.reduce((sum, d) => sum + d.count, 0));
      } catch {
        setLocations([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen text-foreground p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <Card className="border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-primary text-xl md:text-2xl flex items-center">
                <MapPin className="mr-2" size={28} /> Crime Heatmap
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {totalReports} total reports across {locations.length} districts
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="w-full h-[500px] flex items-center justify-center">
                <Loader2 className="animate-spin" size={32} />
              </div>
            ) : (
              <div className="w-full h-[500px] rounded-lg overflow-hidden">
                <LeafletMap locations={locations} />
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span className="font-medium">Density:</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" /> Low
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500" /> Medium
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-500" /> High
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-600" /> Critical
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
