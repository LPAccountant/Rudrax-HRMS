"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Play, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PayrollRecord {
  id: string; month: number; year: number; workingDays: number; presentDays: number; leaveDays: number;
  grossEarnings: number; totalDeductions: number; netSalary: number; status: string;
  employee: { firstName: string; lastName: string; employeeId: string; department: { name: string } | null };
}

export default function PayrollPage() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payroll?month=${month}&year=${year}`);
      if (res.ok) setRecords(await res.json());
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPayroll(); }, [month, year]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/payroll", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ month, year }) });
      if (res.ok) fetchPayroll();
    } catch (error) { console.error(error); }
    finally { setGenerating(false); }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/payroll/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "APPROVED" }) });
      if (res.ok) fetchPayroll();
    } catch (error) { console.error(error); }
  };

  const handlePay = async (id: string) => {
    try {
      const res = await fetch(`/api/payroll/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "PAID" }) });
      if (res.ok) fetchPayroll();
    } catch (error) { console.error(error); }
  };

  const statusColor = (s: string) => {
    switch (s) { case "PAID": return "success"; case "APPROVED": return "default"; case "DRAFT": return "secondary"; default: return "outline"; }
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const totalNet = records.reduce((s, r) => s + r.netSalary, 0);
  const totalGross = records.reduce((s, r) => s + r.grossEarnings, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Payroll</h1><p className="text-sm text-muted-foreground">Process and manage employee payroll</p></div>
        <Button onClick={handleGenerate} disabled={generating}><Play className="mr-2 h-4 w-4" />{generating ? "Generating..." : "Generate Payroll"}</Button>
      </div>

      <div className="flex items-center gap-4">
        <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v))}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>{months.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>{[2024, 2025, 2026].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <div className="ml-auto flex gap-4">
          <Card className="px-4 py-2"><p className="text-xs text-muted-foreground">Total Gross</p><p className="font-semibold">{formatCurrency(totalGross)}</p></Card>
          <Card className="px-4 py-2"><p className="text-xs text-muted-foreground">Total Net</p><p className="font-semibold text-primary">{formatCurrency(totalNet)}</p></Card>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center p-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Working Days</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No payroll records. Click &quot;Generate Payroll&quot; to process.</TableCell></TableRow>
                ) : (
                  records.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell><div><p className="font-medium">{rec.employee.firstName} {rec.employee.lastName}</p><p className="text-xs text-muted-foreground">{rec.employee.employeeId}</p></div></TableCell>
                      <TableCell>{rec.employee.department?.name || "-"}</TableCell>
                      <TableCell>{rec.workingDays}</TableCell>
                      <TableCell>{rec.presentDays}</TableCell>
                      <TableCell>{formatCurrency(rec.grossEarnings)}</TableCell>
                      <TableCell className="text-destructive">{formatCurrency(rec.totalDeductions)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(rec.netSalary)}</TableCell>
                      <TableCell><Badge variant={statusColor(rec.status)}>{rec.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {rec.status === "DRAFT" && <Button size="sm" variant="outline" onClick={() => handleApprove(rec.id)}>Approve</Button>}
                          {rec.status === "APPROVED" && <Button size="sm" onClick={() => handlePay(rec.id)}><CheckCircle className="mr-1 h-3 w-3" />Pay</Button>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
