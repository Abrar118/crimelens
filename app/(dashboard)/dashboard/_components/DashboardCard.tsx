"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronsDown, ChevronsUp, type LucideIcon } from "lucide-react";

type DashboardCardProps = {
  title: string; // Title of the card
  description: string; // Description of the card
  Icon: LucideIcon; // Icon of the card
  onClick?: () => void; // OnClick event
  value: string; // Value of the card
  upOrDown: boolean; // increase or decrease
};

const DashboardCard = ({
  title,
  description,
  Icon,
  onClick,
  value,
  upOrDown,
}: DashboardCardProps) => {
  return (
    <Card onClick={() => onClick?.()}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold flex items-center gap-2">
          {value}
          {upOrDown ? (
            <ChevronsUp className="h-4 w-4 text-teal-500" />
          ) : (
            <ChevronsDown className="h-4 w-4 text-red-500" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
