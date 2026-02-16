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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Plus, Check, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface LeaveType { id: string; name: string; code: string; daysPerYear: number; }
interface LeaveBalance { id: string; allocated: number; used: number; remaining: number; leaveType: LeaveType; }
interface LeaveRequest {
  id: string; startDate: string; endDate: string; days: number; reason: string; status: string; createdAt: string;
  employee: { firstName: string; lastName: string; employeeId: string };
  leaveType: { name: string; code: string };
}

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ leaveTypeId: "", startDate: "", endDate: "", reason: "" });

  const fetchData = async () => {
    try {
      const [reqRes, balRes, ltRes] = await Promise.all([
        fetch("/api/leave"), fetch("/api/leave/balances"), fetch("/api/leave/types"),
      ]);
      if (reqRes.ok) { const data = await reqRes.json(); setRequests(data.requests); }
      if (balRes.ok) setBalances(await balRes.json());
      if (ltRes.ok) setLeaveTypes(await ltRes.json());
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApply = async () => {
    try {
      const res = await fetch("/api/leave", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { setShowApply(false); setForm({ leaveTypeId: "", startDate: "", endDate: "", reason: "" }); fetchData(); }
    } catch (error) { console.error(error); }
  };

  const handleAction = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/leave/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (res.ok) fetchData();
    } catch (error) { console.error(error); }
  };

  const statusColor = (s: string) => {
    switch (s) { case "APPROVED": return "success"; case "REJECTED": return "destructive"; case "PENDING": return "warning"; default: return "secondary"; }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Leave Management</h1><p className="text-sm text-muted-foreground">Apply and manage leave requests</p></div>
        <Button onClick={() => setShowApply(true)}><Plus className="mr-2 h-4 w-4" />Apply Leave</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {balances.map((bal) => (
          <Card key={bal.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{bal.leaveType.name}</h4>
                <Badge variant="outline">{bal.leaveType.code}</Badge>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Used: {bal.used}</span><span>Remaining: {bal.remaining}</span>
                </div>
                <Progress value={(bal.used / bal.allocated) * 100} className="h-2" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground text-right">of {bal.allocated} days</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Leave Requests</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No leave requests</TableCell></TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.employee.firstName} {req.employee.lastName}</TableCell>
                    <TableCell><Badge variant="outline">{req.leaveType.code}</Badge></TableCell>
                    <TableCell>{formatDate(req.startDate)}</TableCell>
                    <TableCell>{formatDate(req.endDate)}</TableCell>
                    <TableCell>{req.days}</TableCell>
                    <TableCell><Badge variant={statusColor(req.status)}>{req.status}</Badge></TableCell>
                    <TableCell>
                      {req.status === "PENDING" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => handleAction(req.id, "APPROVED")}><Check className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleAction(req.id, "REJECTED")}><X className="h-4 w-4" /></Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showApply} onOpenChange={setShowApply}>
        <DialogContent>
          <DialogHeader><DialogTitle>Apply for Leave</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Leave Type *</Label>
              <Select value={form.leaveTypeId} onValueChange={(v) => setForm({ ...form, leaveTypeId: v })}>
                <SelectTrigger><SelectValue placeholder="Select leave type" /></SelectTrigger>
                <SelectContent>{leaveTypes.map((lt) => <SelectItem key={lt.id} value={lt.id}>{lt.name} ({lt.code})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Start Date *</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>End Date *</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Reason</Label><Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Enter reason for leave" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApply(false)}>Cancel</Button>
            <Button onClick={handleApply} disabled={!form.leaveTypeId || !form.startDate || !form.endDate}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
