"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface AuditLog {
  id: string; action: string; entity: string; entityId: string; details: string; createdAt: string;
  user: { email: string } | null;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/audit-logs");
        if (res.ok) { const data = await res.json(); setLogs(data.logs); }
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchLogs();
  }, []);

  const actionColor = (a: string) => {
    switch (a) { case "CREATE": return "success"; case "UPDATE": return "default"; case "DELETE": case "DEACTIVATE": return "destructive"; case "LOGIN": return "secondary"; default: return "outline"; }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Audit Logs</h1><p className="text-sm text-muted-foreground">Track all system activities and changes</p></div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8"><Shield className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />No audit logs</TableCell></TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs">{formatDateTime(log.createdAt)}</TableCell>
                    <TableCell className="text-sm">{log.user?.email || "System"}</TableCell>
                    <TableCell><Badge variant={actionColor(log.action)}>{log.action}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{log.entity}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{log.details}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
