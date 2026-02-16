"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogOut, FileText } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function ExitPage() {
  const [exits, setExits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/employees?status=INACTIVE");
        if (res.ok) {
          const data = await res.json();
          setExits(data.employees || []);
        }
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Exit Process</h1><p className="text-sm text-muted-foreground">Manage employee exit and full-and-final settlement</p></div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exits.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8"><LogOut className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />No exit processes</TableCell></TableRow>
              ) : (
                exits.map((emp: any) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.firstName} {emp.lastName}</TableCell>
                    <TableCell><Badge variant="outline">{emp.employeeId}</Badge></TableCell>
                    <TableCell>{emp.department?.name || "-"}</TableCell>
                    <TableCell>{formatDate(emp.dateOfJoining)}</TableCell>
                    <TableCell><Badge variant="destructive">{emp.status}</Badge></TableCell>
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
