"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Bell,
  ThumbsUp,
  MessageCircle,
  ShieldAlert,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

const dummyNotifications = [
  {
    id: "1",
    type: "upvote",
    message: "Your crime report received an upvote!",
    user: "John Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
    timestamp: "5 minutes ago",
    unread: true,
  },
  {
    id: "2",
    type: "comment",
    message: "New comment: 'This is concerning!'",
    user: "Sarah Smith",
    avatar: "https://i.pravatar.cc/150?img=2",
    timestamp: "15 minutes ago",
    unread: true,
  },
  {
    id: "3",
    type: "admin",
    message: "Admin has verified your crime report.",
    user: "Admin",
    avatar: "https://i.pravatar.cc/150?img=3",
    timestamp: "1 hour ago",
    unread: false,
  },
  {
    id: "4",
    type: "comment",
    message: "User 'Mike' replied: 'Stay safe!'",
    user: "Mike Johnson",
    avatar: "https://i.pravatar.cc/150?img=4",
    timestamp: "2 hours ago",
    unread: false,
  },
];

const Notification: React.FC = () => {
  const [notifications, setNotifications] = useState(dummyNotifications);
  const { toast } = useToast();

  // Mark all as read with confirmation toast
  const markAllAsRead = () => {
    toast({
      title: "Marking All as Read",
      description: "All notifications will be marked as read.",
      action: (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setNotifications(
              notifications.map((n) => ({ ...n, unread: false }))
            );
            toast({
              title: "Success",
              description: "All notifications marked as read.",
            });
          }}
        >
          Confirm
        </Button>
      ),
    });
  };

  // Clear all notifications with confirmation toast
  const clearAllNotifications = () => {
    toast({
      title: "Clear All Notifications?",
      description: "This action cannot be undone.",
      action: (
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            setNotifications([]);
            toast({
              title: "Deleted",
              description: "All notifications cleared.",
            });
          }}
        >
          Confirm
        </Button>
      ),
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white p-6">
      <Toaster />
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-yellow-400 flex items-center">
            <Bell className="mr-2" size={24} /> Notifications
          </h1>

          {/* Buttons */}
          <div className="flex gap-3 mt-3 md:mt-0">
            <Button
              variant="outline"
              className="text-yellow-400 border-yellow-500 hover:bg-yellow-500 hover:text-black"
              onClick={markAllAsRead}
            >
              <CheckCircle className="mr-2" size={16} /> Mark All as Read
            </Button>
            <Button
              variant="outline"
              className="text-red-400 border-red-500 hover:bg-red-500 hover:text-black"
              onClick={clearAllNotifications}
            >
              <Trash2 className="mr-2" size={16} /> Clear All
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className="bg-gray-900 border border-gray-700"
              >
                <CardHeader className="flex flex-row justify-between items-center">
                  <div className="flex items-center space-x-4">
                    {/* User Avatar */}
                    <Avatar>
                      <AvatarImage
                        src={notification.avatar}
                        alt={notification.user}
                      />
                      <AvatarFallback>
                        {notification.user.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <CardTitle className="text-white">
                        <span className="font-semibold">
                          {notification.user}
                        </span>{" "}
                        {notification.message}
                      </CardTitle>
                      <p className="text-gray-400 text-sm">
                        {notification.timestamp}
                      </p>
                    </div>
                  </div>

                  {/* Notification Type Icon */}
                  {notification.type === "upvote" && (
                    <Badge className="bg-green-500 text-white">
                      <ThumbsUp className="mr-1" size={16} /> Upvote
                    </Badge>
                  )}
                  {notification.type === "comment" && (
                    <Badge className="bg-blue-400 text-white">
                      <MessageCircle className="mr-1" size={16} /> Comment
                    </Badge>
                  )}
                  {notification.type === "admin" && (
                    <Badge className="bg-red-500 text-white">
                      <ShieldAlert className="mr-1" size={16} /> Admin Action
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="text-gray-400 text-sm">
                  {notification.unread && (
                    <span className="text-yellow-400">New</span>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-400">No new notifications.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
