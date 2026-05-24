import {
  Bell,
  BookOpen,
  Bot,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items: { title: string; url: string }[];
}

export const navMain: NavItem[] = [
  {
    title: "General",
    url: "#",
    icon: SquareTerminal,
    items: [
      { title: "Dashboard", url: "/dashboard" },
      { title: "Report a Crime", url: "/report" },
      { title: "Crime Feed", url: "/crime-feed" },
    ],
  },
  {
    title: "My Profile",
    url: "#",
    icon: Bot,
    items: [
      { title: "Information", url: "/profile" },
      { title: "My Reports", url: "/profile/my-reports" },
    ],
  },
  {
    title: "Alert & Update",
    url: "#",
    icon: Bell,
    items: [
      { title: "Notification", url: "/notifications" },
      { title: "Emergency", url: "/emergency" },
    ],
  },
  {
    title: "Survey",
    url: "#",
    icon: BookOpen,
    items: [
      { title: "Heatmap", url: "/heatmap" },
      { title: "Leaderboard", url: "/leaderboard" },
    ],
  },
];
