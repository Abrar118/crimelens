"use client";

import type * as React from "react";
import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
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
import { getMyProfile } from "@/lib/api/users";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user);
  const { unreadCount } = useNotifications();
  const [profileImage, setProfileImage] = useState("/images/avatar.jpg");

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getMyProfile();
        if (profile?.profile_image) {
          setProfileImage(profile.profile_image);
        }
      } catch {}
    }
    if (user) loadProfile();
  }, [user]);

  const userData = {
    name: user?.displayName ?? user?.email?.split("@")[0] ?? "User",
    email: user?.email ?? "",
    avatar: profileImage,
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
        <div className="flex items-center gap-2 px-2 py-2 overflow-hidden">
          <Shield size={20} className="text-primary flex-shrink-0" />
          <span className="font-bold text-sm truncate group-data-[collapsible=icon]:hidden">
            CrimeLens
          </span>
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
