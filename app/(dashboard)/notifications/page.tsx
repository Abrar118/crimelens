"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  MessageCircle,
  ThumbsUp,
  ShieldAlert,
  CheckCheck,
  ExternalLink,
} from "lucide-react";
import { useNotifications, type Notification } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const TYPE_ICONS: Record<string, typeof Bell> = {
  comment: MessageCircle,
  vote: ThumbsUp,
  admin_ban: ShieldAlert,
  admin_delete: ShieldAlert,
};

const TYPE_COLORS: Record<string, string> = {
  comment: "text-blue-400",
  vote: "text-green-400",
  admin_ban: "text-red-400",
  admin_delete: "text-red-400",
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="min-h-screen text-white p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell size={24} /> Notifications
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
            )}
          </h1>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck size={16} className="mr-2" /> Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No notifications yet</p>
        ) : (
          notifications.map((notif) => {
            const Icon = TYPE_ICONS[notif.type] || Bell;
            const color = TYPE_COLORS[notif.type] || "text-gray-400";

            return (
              <Card
                key={notif.id}
                className={`border cursor-pointer transition-colors ${
                  notif.read
                    ? "bg-gray-900/30 border-gray-800"
                    : "bg-gray-900 border-gray-600"
                }`}
                onClick={() => markAsRead(notif.id)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <Icon size={20} className={color} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notif.read ? "text-gray-400" : "text-white"}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {notif.post_id && (
                    <Link href={`/crime-feed/${notif.post_id}`} onClick={(e) => e.stopPropagation()}>
                      <ExternalLink size={16} className="text-gray-400 hover:text-white" />
                    </Link>
                  )}
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
