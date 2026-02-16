"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, Info, AlertTriangle, XCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface Notification {
  id: string; title: string; message: string; type: string; isRead: boolean; link: string; createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) { const data = await res.json(); setNotifications(data.notifications); setUnreadCount(data.unreadCount); }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      fetchNotifications();
    } catch (error) { console.error(error); }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAll: true }) });
      fetchNotifications();
    } catch (error) { console.error(error); }
  };

  const typeIcon = (type: string) => {
    switch (type) { case "WARNING": return <AlertTriangle className="h-4 w-4 text-amber-500" />; case "ERROR": return <XCircle className="h-4 w-4 text-destructive" />; default: return <Info className="h-4 w-4 text-primary" />; }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-sm text-muted-foreground">{unreadCount} unread notifications</p></div>
        {unreadCount > 0 && <Button variant="outline" onClick={markAllRead}><CheckCheck className="mr-2 h-4 w-4" />Mark all read</Button>}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card><CardContent className="py-12 text-center"><Bell className="mx-auto h-12 w-12 text-muted-foreground/30" /><p className="mt-3 text-muted-foreground">No notifications</p></CardContent></Card>
        ) : (
          notifications.map((notif) => (
            <Card key={notif.id} className={notif.isRead ? "opacity-60" : "border-l-4 border-l-primary"}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {typeIcon(notif.type)}
                    <div>
                      <h4 className="text-sm font-semibold">{notif.title}</h4>
                      <p className="text-sm text-muted-foreground">{notif.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(notif.createdAt)}</p>
                    </div>
                  </div>
                  {!notif.isRead && <Button variant="ghost" size="sm" onClick={() => markAsRead(notif.id)}>Mark read</Button>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
