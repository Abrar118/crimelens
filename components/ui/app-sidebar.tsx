"use client";

import type * as React from "react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { navMain } from "@/lib/data/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} variant="floating" side="left">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <span className="font-bold text-lg">CrimeLens</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: "User", email: "user@example.com", avatar: "/images/avatar.jpg" }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
