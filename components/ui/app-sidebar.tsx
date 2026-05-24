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
import { useAuthStore } from "@/lib/store";
import { useNotifications } from "@/hooks/use-notifications";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user);
  const { unreadCount } = useNotifications();

  const userData = {
    name: user?.displayName ?? user?.email?.split("@")[0] ?? "User",
    email: user?.email ?? "",
    avatar: user?.photoURL ?? "/images/avatar.jpg",
  };

  const navWithBadge = navMain.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      badge: item.url === "/notifications" && unreadCount > 0 ? unreadCount : undefined,
    })),
  }));

  return (
    <Sidebar collapsible="icon" {...props} variant="floating" side="left">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <span className="font-bold text-lg">CrimeLens</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navWithBadge} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
