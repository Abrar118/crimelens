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
    <Card className="bg-card border border-border">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Icon size={20} className={config.color} />
          <div>
            <p className="font-medium text-foreground text-sm">{contact.name}</p>
            <p className="text-muted-foreground text-xs">{contact.number}</p>
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
    <div className="min-h-screen text-foreground p-4 md:p-6">
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
          <span className="text-sm text-muted-foreground">Select Division:</span>
          <Select value={selectedDivision} onValueChange={setSelectedDivision}>
            <SelectTrigger className="w-48 bg-card text-foreground border-border">
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
            <h2 className="text-xl font-semibold text-foreground">
              {selectedDivision} Division
            </h2>
            {Object.entries(groupedContacts).map(([type, contacts]) => {
              const config = TYPE_CONFIG[type];
              return (
                <div key={type}>
                  <h3 className={`text-sm font-medium mb-2 ${config?.color || "text-muted-foreground"}`}>
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
