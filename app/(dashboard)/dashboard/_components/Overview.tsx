"use client";

import { Contact, NotebookPen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardCard from "./DashboardCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import Chart from "@/components/chart";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const Overview = ({
  chartData,
  recentResonses,
  npsData,
  satisfactionData,
}: {
  chartData: { month: string; CSAT: number; FAR: number }[];
  recentResonses: { name: string; email: string; surveyName: string }[];
  npsData: { date: string; nps: number; ces: number }[];
  satisfactionData: { date: string; csat: number; adoption: number }[];
}) => {
  const [selectedYear, setSelectedYear] = useState("2023");
  const minNps = Math.min(...npsData.map((data) => data.nps));
  const maxNps = Math.max(...npsData.map((data) => data.nps));
  const minCes = Math.min(...npsData.map((data) => data.ces));
  const maxCes = Math.max(...npsData.map((data) => data.ces));
  const minCsat = Math.min(...satisfactionData.map((data) => data.csat));
  const maxCsat = Math.max(...satisfactionData.map((data) => data.csat));
  const minAdoption = Math.min(
    ...satisfactionData.map((data) => data.adoption)
  );
  const maxAdoption = Math.max(
    ...satisfactionData.map((data) => data.adoption)
  );

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Reports"
          description="Total number of reports submitted"
          Icon={NotebookPen}
          value={"5"}
          upOrDown={true}
        />
        <DashboardCard
          title="Unsolved in local area"
          description="Number of unsolved reports in your area"
          Icon={Contact}
          value={"58"}
          upOrDown={false}
        />
        <DashboardCard
          title="My reports"
          description="Number of reports you have submitted"
          Icon={NotebookPen}
          value={"125"}
          upOrDown={true}
        />
        <DashboardCard
          title="Leaderboard position"
          description="Your position in the top 10% of users"
          Icon={NotebookPen}
          value={"6"}
          upOrDown={false}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* chart */}
        <div className="flex flex-col gap-3 md:col-span-4  rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1 ml-2">
              <h3 className="text-white font-semibold">
                Performance Overview
              </h3>
              <h4 className="text-muted-foreground font-bold">
                {selectedYear} Performance Overview
              </h4>
            </div>

            <Select
              onValueChange={(value) => {
                setSelectedYear(value);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={`${selectedYear}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Chart chartData={chartData} />
        </div>

        {/* recent responses */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Responses</CardTitle>
            <div className="text-sm text-muted-foreground">
              You have 10 new responses
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8 ">
              {recentResonses.map((sale) => (
                <div key={sale.email} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={`/placeholder.svg?text=${sale.name.charAt(0)}`}
                      alt={sale.name}
                    />
                    <AvatarFallback>{sale.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {sale.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {sale.surveyName}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    {sale.name.split(" ").at(0)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* lower section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* NPS vs CES */}
        <Card>
          <CardHeader>
            <CardTitle>Net Promoter Score vs. Customer Effort Score</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={npsData}>
                <XAxis dataKey="date" />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#10b981"
                  domain={[minNps - 5, maxNps + 5]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#6366f1"
                  domain={[minCes - 1, maxCes + 1]}
                />
                <Tooltip />
                <Legend />
                <Line
                  strokeWidth={2}
                  yAxisId="left"
                  type="natural"
                  dataKey="nps"
                  stroke="#10b981"
                  name="Net Promoter Score (NPS)"
                  label={{
                    fill: "#10b981",
                    fontSize: 12,
                    textAnchor: "middle",
                    dy: 15,
                  }}
                />
                <Line
                  strokeWidth={2}
                  yAxisId="right"
                  type="natural"
                  dataKey="ces"
                  stroke="#6366f1"
                  name="Customer Effort Score (CES)"
                  label={{
                    fill: "#6366f1",
                    fontSize: 12,
                    textAnchor: "middle",
                    dy: 10,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* CSAT vs Adoption */}
        <Card>
          <CardHeader>
            <CardTitle>
              Customer Satisfaction Score vs. Feature Adoption Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={satisfactionData}>
                <XAxis dataKey="date" />
                <YAxis
                  domain={[
                    Math.min(minCsat, minAdoption) - 5,
                    Math.max(maxCsat, maxAdoption) + 5,
                  ]}
                />
                <Tooltip />
                <Legend />
                <Line
                  strokeWidth={2}
                  type="natural"
                  dataKey="csat"
                  stroke="#10b981"
                  name="Customer Satisfaction Score (CSAT)"
                  label={{
                    fill: "#10b981",
                    fontSize: 12,
                    textAnchor: "middle",
                    dy: 10,
                  }}
                />
                <Line
                  strokeWidth={2}
                  type="natural"
                  dataKey="adoption"
                  stroke="#6366f1"
                  name="Feature Adoption Rate"
                  label={{
                    fill: "#6366f1",
                    fontSize: 12,
                    textAnchor: "middle",
                    dy: 10,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Overview;
