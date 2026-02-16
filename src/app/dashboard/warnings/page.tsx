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
import { AlertTriangle, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Warning {
  id: string; type: string; subject: string; description: string; status: string; issuedAt: string;
  employee: { firstName: string; lastName: string; employeeId: string };
}

interface Employee { id: string; firstName: string; lastName: string; employeeId: string; }

export default function WarningsPage() {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ employeeId: "", type: "WARNING", subject: "", description: "" });

  const fetchData = async () => {
    try {
      const [wRes, eRes] = await Promise.all([fetch("/api/warnings"), fetch("/api/employees")]);
      if (wRes.ok) setWarnings(await wRes.json());
      if (eRes.ok) { const data = await eRes.json(); setEmployees(data.employees); }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async () => {
    try {
      const res = await fetch("/api/warnings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { setShowAdd(false); setForm({ employeeId: "", type: "WARNING", subject: "", description: "" }); fetchData(); }
    } catch (error) { console.error(error); }
  };

  const typeColor = (t: string) => {
    switch (t) { case "WARNING": return "warning"; case "NOTICE": return "default"; case "TERMINATION": return "destructive"; default: return "secondary"; }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Warnings & Notices</h1><p className="text-sm text-muted-foreground">Issue and track employee warnings</p></div>
        <Button onClick={() => setShowAdd(true)}><Plus className="mr-2 h-4 w-4" />Issue Warning</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Type</TableHead><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {warnings.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No warnings issued</TableCell></TableRow>
              ) : (
                warnings.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.employee.firstName} {w.employee.lastName}</TableCell>
                    <TableCell><Badge variant={typeColor(w.type)}>{w.type}</Badge></TableCell>
                    <TableCell>{w.subject}</TableCell>
                    <TableCell><Badge variant="outline">{w.status}</Badge></TableCell>
                    <TableCell>{formatDate(w.issuedAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Issue Warning</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Employee *</Label>
              <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="WARNING">Warning</SelectItem><SelectItem value="NOTICE">Notice</SelectItem><SelectItem value="MEMO">Memo</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Subject *</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button><Button onClick={handleAdd} disabled={!form.employeeId || !form.subject}>Issue</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
