"use client";

import { CalendarIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { PopoverContent } from "@radix-ui/react-popover";
import Overview from "./_components/Overview";
import {
  chartData,
  recentResonses,
  npsData,
  satisfactionData,
} from "@/lib/data/dashboard-dummy";

export default function Dashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-background">
      {/* top section  */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center justify-between space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="hidden md:flex">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Jan 20, 2023 - Feb 09, 2023
              </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-background mt-3 mr-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>

          <Button>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview  */}
        <TabsContent value="overview" className="space-y-4">
          <Overview
            chartData={chartData}
            recentResonses={recentResonses}
            npsData={npsData}
            satisfactionData={satisfactionData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
