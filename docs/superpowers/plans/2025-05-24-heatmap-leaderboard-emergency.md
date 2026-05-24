# Heatmap + Leaderboard + Emergency Contacts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire three placeholder pages to real data: crime heatmap with district-level circle markers, leaderboard with MongoDB-aggregated contributor scores, and emergency contacts organized by Bangladesh divisions.

**Architecture:** Create two new API routes (post locations aggregation, leaderboard aggregation), a static emergency contacts data file, and rewrite all three page components. The heatmap maps post district names to coordinates from the existing districts.json. The leaderboard aggregates post + comment counts into scores. Emergency contacts use a division selector with geolocation auto-detect.

**Tech Stack:** Next.js 15, MongoDB aggregation, Leaflet/React-Leaflet (CircleMarker), shadcn/ui, date-fns

**UI Design:** Use the `ui-ux-pro-max` skill for polished UI on all three pages during implementation.

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `app/api/v1/posts/locations/route.ts` | Create | Aggregated post counts by district |
| `app/api/v1/leaderboard/route.ts` | Create | Top 20 contributors with scores |
| `lib/api/posts.ts` | Modify | Add getPostLocations, getLeaderboard |
| `lib/data/emergency-contacts.ts` | Create | Bangladesh emergency contacts by division |
| `app/(dashboard)/heatmap/_components/LeafletMap.tsx` | Rewrite | Circle markers with popups |
| `app/(dashboard)/heatmap/page.tsx` | Rewrite | Fetch real data, color legend |
| `app/(dashboard)/leaderboard/page.tsx` | Rewrite | Real scores, medals for top 3 |
| `app/(dashboard)/emergency/page.tsx` | Rewrite | Division selector, grouped contacts |

---

## Task 1: API Routes + Client Functions

**Files:**
- Create: `app/api/v1/posts/locations/route.ts`
- Create: `app/api/v1/leaderboard/route.ts`
- Modify: `lib/api/posts.ts`

- [ ] **Step 1: Create `app/api/v1/posts/locations/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  const db = await getDb();

  const locations = await db.collection("posts").aggregate([
    {
      $group: {
        _id: { district: "$district", division: "$division" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        district: "$_id.district",
        division: "$_id.division",
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]).toArray();

  return NextResponse.json(locations);
}
```

- [ ] **Step 2: Create `app/api/v1/leaderboard/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  const db = await getDb();

  const postCounts = await db.collection("posts").aggregate([
    { $match: { is_anonymous: { $ne: true } } },
    { $group: { _id: "$user_id", post_count: { $sum: 1 } } },
  ]).toArray();

  const commentCounts = await db.collection("comments").aggregate([
    { $group: { _id: "$user_id", comment_count: { $sum: 1 } } },
  ]).toArray();

  const commentMap = new Map(
    commentCounts.map((c) => [c._id, c.comment_count])
  );

  const merged = postCounts.map((p) => ({
    user_id: p._id as string,
    post_count: p.post_count as number,
    comment_count: (commentMap.get(p._id) as number) || 0,
    score: (p.post_count as number) * 10 + ((commentMap.get(p._id) as number) || 0) * 5,
  }));

  for (const [userId, count] of commentMap.entries()) {
    if (!postCounts.find((p) => p._id === userId)) {
      merged.push({
        user_id: userId as string,
        post_count: 0,
        comment_count: count as number,
        score: (count as number) * 5,
      });
    }
  }

  merged.sort((a, b) => b.score - a.score);
  const top20 = merged.slice(0, 20);

  const userIds = top20.map((u) => u.user_id);
  const users = await db.collection("users")
    .find({ _id: { $in: userIds } as any })
    .project({ name: 1, profile_image: 1 })
    .toArray();

  const userMap = new Map(users.map((u) => [String(u._id), u]));

  const result = top20.map((entry) => {
    const user = userMap.get(entry.user_id);
    return {
      ...entry,
      name: user?.name || "Unknown",
      profile_image: user?.profile_image || "",
    };
  });

  return NextResponse.json(result);
}
```

- [ ] **Step 3: Add client functions to `lib/api/posts.ts`**

Append these two functions at the end of the file:

```typescript

export async function getPostLocations() {
  const { data } = await apiClient.get("/posts/locations");
  return data;
}

export async function getLeaderboard() {
  const { data } = await apiClient.get("/leaderboard");
  return data;
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/v1/posts/locations/ app/api/v1/leaderboard/ lib/api/posts.ts
git commit -m "feat: add post locations and leaderboard API routes"
```

---

## Task 2: Emergency Contacts Data File

**Files:**
- Create: `lib/data/emergency-contacts.ts`

- [ ] **Step 1: Create `lib/data/emergency-contacts.ts`**

```typescript
export interface EmergencyContact {
  name: string;
  number: string;
  type: "police" | "fire" | "ambulance" | "hospital" | "helpline";
}

export interface DivisionContacts {
  division: string;
  contacts: EmergencyContact[];
}

export const nationalContacts: EmergencyContact[] = [
  { name: "National Emergency", number: "999", type: "police" },
  { name: "Fire Service", number: "199", type: "fire" },
  { name: "Ambulance (Dhaka)", number: "199", type: "ambulance" },
  { name: "Women & Child Helpline", number: "10921", type: "helpline" },
  { name: "Anti-Corruption Commission", number: "106", type: "helpline" },
  { name: "Cyber Crime", number: "01766678888", type: "helpline" },
  { name: "RAB Headquarters", number: "01779554391", type: "police" },
  { name: "Tourist Police", number: "01769690000", type: "police" },
];

export const divisionContacts: DivisionContacts[] = [
  {
    division: "Dhaka",
    contacts: [
      { name: "Dhaka Metropolitan Police", number: "01713373173", type: "police" },
      { name: "Dhaka Medical College Hospital", number: "02-55165088", type: "hospital" },
      { name: "BIRDEM Hospital", number: "02-8616641", type: "hospital" },
      { name: "Dhaka Fire Station (HQ)", number: "02-9555555", type: "fire" },
      { name: "Ambulance (DMCH)", number: "02-8626812", type: "ambulance" },
    ],
  },
  {
    division: "Chattogram",
    contacts: [
      { name: "Chattogram Metropolitan Police", number: "031-2855998", type: "police" },
      { name: "Chattogram Medical College", number: "031-630335", type: "hospital" },
      { name: "Chattogram Fire Station", number: "031-2850222", type: "fire" },
      { name: "Ambulance (CMC)", number: "031-2854871", type: "ambulance" },
    ],
  },
  {
    division: "Rajshahi",
    contacts: [
      { name: "Rajshahi Metropolitan Police", number: "0721-776301", type: "police" },
      { name: "Rajshahi Medical College", number: "0721-772150", type: "hospital" },
      { name: "Rajshahi Fire Station", number: "0721-774422", type: "fire" },
    ],
  },
  {
    division: "Khulna",
    contacts: [
      { name: "Khulna Metropolitan Police", number: "041-720666", type: "police" },
      { name: "Khulna Medical College", number: "041-761053", type: "hospital" },
      { name: "Khulna Fire Station", number: "041-721555", type: "fire" },
    ],
  },
  {
    division: "Barishal",
    contacts: [
      { name: "Barishal Police", number: "0431-2173375", type: "police" },
      { name: "Sher-e-Bangla Medical College", number: "0431-2173201", type: "hospital" },
      { name: "Barishal Fire Station", number: "0431-2173100", type: "fire" },
    ],
  },
  {
    division: "Sylhet",
    contacts: [
      { name: "Sylhet Metropolitan Police", number: "0821-714243", type: "police" },
      { name: "Sylhet MAG Osmani Medical College", number: "0821-713667", type: "hospital" },
      { name: "Sylhet Fire Station", number: "0821-713070", type: "fire" },
    ],
  },
  {
    division: "Rangpur",
    contacts: [
      { name: "Rangpur Police", number: "0521-63470", type: "police" },
      { name: "Rangpur Medical College", number: "0521-63051", type: "hospital" },
      { name: "Rangpur Fire Station", number: "0521-62222", type: "fire" },
    ],
  },
  {
    division: "Mymensingh",
    contacts: [
      { name: "Mymensingh Police", number: "091-66523", type: "police" },
      { name: "Mymensingh Medical College", number: "091-67392", type: "hospital" },
      { name: "Mymensingh Fire Station", number: "091-65555", type: "fire" },
    ],
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add lib/data/emergency-contacts.ts
git commit -m "feat: add Bangladesh emergency contacts data by division"
```

---

## Task 3: Heatmap Page + LeafletMap Rewrite

**Files:**
- Rewrite: `app/(dashboard)/heatmap/_components/LeafletMap.tsx`
- Rewrite: `app/(dashboard)/heatmap/page.tsx`

- [ ] **Step 1: Rewrite `app/(dashboard)/heatmap/_components/LeafletMap.tsx`**

```typescript
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
```

- [ ] **Step 2: Rewrite `app/(dashboard)/heatmap/page.tsx`**

```typescript
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
    <div className="w-full h-[500px] rounded-lg overflow-hidden flex items-center justify-center bg-gray-800 text-gray-400">
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
    <div className="min-h-screen text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <Card className="border border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-primary text-xl md:text-2xl flex items-center">
                <MapPin className="mr-2" size={28} /> Crime Heatmap
              </CardTitle>
              <div className="text-sm text-gray-400">
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
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
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
```

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/heatmap/
git commit -m "feat: wire heatmap to real post location data with circle markers"
```

---

## Task 4: Leaderboard Page Rewrite

**Files:**
- Rewrite: `app/(dashboard)/leaderboard/page.tsx`

- [ ] **Step 1: Replace entire content of `app/(dashboard)/leaderboard/page.tsx`**

```typescript
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Medal,
  MessageCircle,
  FileText,
  Loader2,
  Crown,
} from "lucide-react";
import { getLeaderboard } from "@/lib/api/posts";
import { useAuth } from "@/hooks/use-auth";

interface LeaderboardEntry {
  user_id: string;
  name: string;
  profile_image: string;
  post_count: number;
  comment_count: number;
  score: number;
}

const RANK_STYLES: Record<number, { icon: typeof Trophy; color: string; bg: string }> = {
  1: { icon: Crown, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" },
  2: { icon: Medal, color: "text-gray-300", bg: "bg-gray-300/10 border-gray-300/30" },
  3: { icon: Medal, color: "text-amber-600", bg: "bg-amber-600/10 border-amber-600/30" },
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getLeaderboard();
        setEntries(data);
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="border border-gray-700">
          <CardHeader>
            <CardTitle className="text-primary text-xl md:text-2xl flex items-center">
              <Trophy className="mr-2 text-yellow-400" size={28} /> Top Contributors
            </CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              Score = Reports x 10 + Comments x 5
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {entries.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No contributors yet</p>
            ) : (
              entries.map((entry, index) => {
                const rank = index + 1;
                const rankStyle = RANK_STYLES[rank];
                const isCurrentUser = user?.uid === entry.user_id;

                return (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      isCurrentUser
                        ? "bg-blue-500/10 border-blue-500/30"
                        : rankStyle
                        ? rankStyle.bg
                        : "bg-gray-900/50 border-gray-700"
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-10 text-center flex-shrink-0">
                      {rankStyle ? (
                        <rankStyle.icon size={24} className={rankStyle.color} />
                      ) : (
                        <span className="text-lg font-bold text-gray-400">#{rank}</span>
                      )}
                    </div>

                    {/* Avatar + Name */}
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={entry.profile_image || "/images/avatar.jpg"} />
                      <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {entry.name}
                        {isCurrentUser && (
                          <span className="text-blue-400 text-xs ml-2">(You)</span>
                        )}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <FileText size={12} /> {entry.post_count} reports
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={12} /> {entry.comment_count} comments
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    <Badge
                      variant="outline"
                      className={`text-sm font-bold flex-shrink-0 ${
                        rankStyle ? rankStyle.color : "text-gray-300"
                      }`}
                    >
                      {entry.score} pts
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/leaderboard/page.tsx
git commit -m "feat: wire leaderboard to real aggregated contributor scores"
```

---

## Task 5: Emergency Contacts Page Rewrite

**Files:**
- Rewrite: `app/(dashboard)/emergency/page.tsx`

- [ ] **Step 1: Replace entire content of `app/(dashboard)/emergency/page.tsx`**

```typescript
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PhoneCall,
  MessageCircle,
  MapPin,
  AlertTriangle,
  Shield,
  Flame,
  Heart,
  Building,
  Headphones,
} from "lucide-react";
import { getDivisionsWithDistricts } from "@/lib/get-division-info";
import {
  nationalContacts,
  divisionContacts,
  type EmergencyContact,
} from "@/lib/data/emergency-contacts";

const divisions = getDivisionsWithDistricts().map((d) => d.name);

const TYPE_CONFIG: Record<string, { icon: typeof Shield; color: string; label: string }> = {
  police: { icon: Shield, color: "text-blue-400", label: "Police" },
  fire: { icon: Flame, color: "text-orange-400", label: "Fire Service" },
  ambulance: { icon: Heart, color: "text-red-400", label: "Ambulance" },
  hospital: { icon: Building, color: "text-green-400", label: "Hospital" },
  helpline: { icon: Headphones, color: "text-purple-400", label: "Helpline" },
};

function ContactCard({ contact }: { contact: EmergencyContact }) {
  const config = TYPE_CONFIG[contact.type] || TYPE_CONFIG.helpline;
  const Icon = config.icon;

  return (
    <Card className="bg-gray-900 border border-gray-700">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Icon size={20} className={config.color} />
          <div>
            <p className="font-medium text-white text-sm">{contact.name}</p>
            <p className="text-gray-400 text-xs">{contact.number}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-green-400 border-green-500 hover:bg-green-500 hover:text-black"
            asChild
          >
            <a href={`tel:${contact.number}`}>
              <PhoneCall size={14} className="mr-1" /> Call
            </a>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-blue-400 border-blue-500 hover:bg-blue-500 hover:text-black"
            asChild
          >
            <a href={`sms:${contact.number}`}>
              <MessageCircle size={14} className="mr-1" /> SMS
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EmergencyPage() {
  const [selectedDivision, setSelectedDivision] = useState("");
  const [userLocation, setUserLocation] = useState<string | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation(
          `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`
        );
      },
      () => {
        setUserLocation("Location not available");
      }
    );
  }, []);

  const divisionData = divisionContacts.find(
    (d) => d.division === selectedDivision
  );

  const groupedContacts: Record<string, EmergencyContact[]> = {};
  if (divisionData) {
    for (const c of divisionData.contacts) {
      if (!groupedContacts[c.type]) groupedContacts[c.type] = [];
      groupedContacts[c.type].push(c);
    }
  }

  return (
    <div className="min-h-screen text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-red-400" size={28} />
          <h1 className="text-2xl md:text-3xl font-bold text-red-400">
            Emergency Contacts
          </h1>
        </div>

        {/* Location */}
        <div className="bg-gray-800 text-yellow-400 p-3 rounded-lg flex items-center">
          <MapPin className="mr-2 flex-shrink-0" size={20} />
          <span className="text-sm">{userLocation}</span>
        </div>

        {/* National Emergency Numbers */}
        <Card className="border-2 border-red-500/30 bg-red-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-400 text-lg flex items-center gap-2">
              <AlertTriangle size={20} /> National Emergency Numbers
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nationalContacts.map((contact, i) => (
              <ContactCard key={i} contact={contact} />
            ))}
          </CardContent>
        </Card>

        {/* Division Selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Select Division:</span>
          <Select value={selectedDivision} onValueChange={setSelectedDivision}>
            <SelectTrigger className="w-48 bg-gray-900 text-white border-gray-700">
              <SelectValue placeholder="Choose division" />
            </SelectTrigger>
            <SelectContent>
              {divisions.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Division-specific Contacts */}
        {selectedDivision && divisionData && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              {selectedDivision} Division
            </h2>
            {Object.entries(groupedContacts).map(([type, contacts]) => {
              const config = TYPE_CONFIG[type];
              return (
                <div key={type}>
                  <h3 className={`text-sm font-medium mb-2 ${config?.color || "text-gray-400"}`}>
                    {config?.label || type}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {contacts.map((contact, i) => (
                      <ContactCard key={i} contact={contact} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedDivision && !divisionData && (
          <p className="text-gray-400 text-center py-8">
            No specific contacts available for this division. Use national numbers above.
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(dashboard\)/emergency/page.tsx
git commit -m "feat: wire emergency contacts page with division selector and real data"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | API routes + client functions | 3 files (locations route, leaderboard route, posts.ts) |
| 2 | Emergency contacts data | `lib/data/emergency-contacts.ts` |
| 3 | Heatmap page + LeafletMap | 2 files (page + component) |
| 4 | Leaderboard page | `app/(dashboard)/leaderboard/page.tsx` |
| 5 | Emergency contacts page | `app/(dashboard)/emergency/page.tsx` |
