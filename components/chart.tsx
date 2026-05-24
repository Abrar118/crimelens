import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  CSAT: {
    label: "Customer Satisfaction Score",
    color: "hsl(var(--chart-4))",
  },
  FAR: {
    label: "Feature Adoption Rate",
    color: "hsl(var(--chart-1))",
  },
  NPS: {
    label: "Net Promoter Score",
    color: "hsl(var(--chart-5))",
  }
} satisfies ChartConfig;

export default function Chart({
  chartData,
}: {
  chartData: { month: string; CSAT: number; FAR: number }[];
}) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={true} />
        <XAxis
          dataKey="month"
          tickLine={true}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="CSAT" fill="var(--color-CSAT)" radius={4} />
        <Bar dataKey="FAR" fill="var(--color-FAR)" radius={4} />
        <Bar dataKey="NPS" fill="var(--color-NPS)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
