"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  PhoneCall,
  MessageCircle,
  Search,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

// Dummy Emergency Contacts (Can be replaced with API Data)
const emergencyContacts = [
  {
    id: 1,
    type: "Police",
    number: "999",
    location: "Bangladesh",
    icon: <AlertCircle size={20} className="text-red-500" />,
  },
  {
    id: 2,
    type: "Fire Service",
    number: "199",
    location: "Bangladesh",
    icon: <AlertCircle size={20} className="text-orange-500" />,
  },
  {
    id: 3,
    type: "Medical Emergency",
    number: "16263",
    location: "Bangladesh",
    icon: <AlertCircle size={20} className="text-green-500" />,
  },
  {
    id: 4,
    type: "Cyber Crime",
    number: "01766678888",
    location: "Bangladesh",
    icon: <AlertCircle size={20} className="text-blue-500" />,
  },
];

const Emergency: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredContacts, setFilteredContacts] = useState(emergencyContacts);
  const [userLocation, setUserLocation] = useState<string | null>(null);

  // Function to get the user's location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation(
          `Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`
        );
      },
      () => {
        setUserLocation("Location not available");
      }
    );
  }, []);

  // Handle Search
  useEffect(() => {
    setFilteredContacts(
      emergencyContacts.filter((contact) =>
        contact.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  // Function to Call
  const handleCall = (number: string) => {
    toast.success(`Calling ${number}...`);
    window.location.href = `tel:${number}`;
  };

  // Function to Send SMS
  const handleMessage = (number: string) => {
    toast.success(`Opening message to ${number}...`);
    window.location.href = `sms:${number}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-red-400 flex items-center">
            <AlertCircle className="mr-2" size={28} /> Emergency Contacts
          </h1>
        </div>

        {/* Location */}
        <div className="bg-gray-800 text-yellow-400 p-3 rounded-lg flex items-center mb-4">
          <MapPin className="mr-2" size={20} />
          <span className="text-sm md:text-base">{userLocation}</span>
        </div>

        {/* Search Bar */}
        <div className="mb-4 w-full">
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-gray-500"
              size={18}
            />
            <Input
              type="text"
              placeholder="Search emergency contacts..."
              className="pl-10 bg-gray-900 text-white border-gray-700 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Emergency Contacts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <Card
                key={contact.id}
                className="bg-gray-900 border border-gray-700"
              >
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    {contact.icon}
                    <div>
                      <CardTitle className="text-white">
                        {contact.type}
                      </CardTitle>
                      <p className="text-gray-400 text-sm">{contact.number}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                  <span className="text-gray-400 text-sm">
                    {contact.location}
                  </span>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-400 border-green-500 hover:bg-green-500 hover:text-black"
                      onClick={() => handleCall(contact.number)}
                    >
                      <PhoneCall className="mr-1" size={16} /> Call
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-400 border-blue-500 hover:bg-blue-500 hover:text-black"
                      onClick={() => handleMessage(contact.number)}
                    >
                      <MessageCircle className="mr-1" size={16} /> Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-400">
              No matching contacts found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Emergency;
