"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Plus, LogIn, LogOut } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  workHours: number;
  lateMinutes: number;
  source: string;
  employee: { firstName: string; lastName: string; employeeId: string };
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?month=${month}&year=${year}`);
      if (res.ok) { const data = await res.json(); setRecords(data.records); }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAttendance(); }, [month, year]);

  const handleCheckIn = async () => {
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkIn: new Date().toISOString(), status: "PRESENT", source: "WEB" }),
      });
      if (res.ok) { fetchAttendance(); setShowMarkAttendance(false); }
    } catch (error) { console.error(error); }
  };

  const statusColor = (s: string) => {
    switch (s) { case "PRESENT": return "success"; case "ABSENT": return "destructive"; case "HALF_DAY": return "warning"; case "ON_LEAVE": return "secondary"; default: return "outline"; }
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Attendance</h1><p className="text-sm text-muted-foreground">Track and manage attendance records</p></div>
        <Button onClick={() => setShowMarkAttendance(true)}><Clock className="mr-2 h-4 w-4" />Mark Attendance</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v))}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>{months.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>{[2024, 2025, 2026].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Work Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Late (min)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No attendance records found</TableCell></TableRow>
                ) : (
                  records.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell className="font-medium">{rec.employee.firstName} {rec.employee.lastName}</TableCell>
                      <TableCell>{formatDate(rec.date)}</TableCell>
                      <TableCell>{rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "-"}</TableCell>
                      <TableCell>{rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "-"}</TableCell>
                      <TableCell>{rec.workHours.toFixed(1)}h</TableCell>
                      <TableCell><Badge variant={statusColor(rec.status)}>{rec.status}</Badge></TableCell>
                      <TableCell>{rec.lateMinutes > 0 ? <span className="text-destructive">{rec.lateMinutes}</span> : "0"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showMarkAttendance} onOpenChange={setShowMarkAttendance}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mark Attendance</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Click below to record your check-in for today.</p>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold">{new Date().toLocaleTimeString("en-IN")}</p>
              <p className="text-sm text-muted-foreground">{formatDate(new Date())}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMarkAttendance(false)}>Cancel</Button>
            <Button onClick={handleCheckIn}><LogIn className="mr-2 h-4 w-4" />Check In</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
