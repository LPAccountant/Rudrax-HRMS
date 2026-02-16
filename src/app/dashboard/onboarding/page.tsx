"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Briefcase, CheckCircle, Clock, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function OnboardingPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/employees?status=ACTIVE");
        if (res.ok) {
          const data = await res.json();
          const recent = data.employees.filter((e: any) => {
            const joined = new Date(e.dateOfJoining);
            const now = new Date();
            const diffDays = (now.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24);
            return diffDays <= 90;
          });
          setEmployees(recent);
        }
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  const checklistItems = [
    "Welcome email sent",
    "System credentials created",
    "Documents submitted",
    "ID card generated",
    "Bank details verified",
    "Policy acknowledgment",
    "Team introduction",
    "Training scheduled",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Onboarding</h1>
        <p className="text-sm text-muted-foreground">Track new employee onboarding progress</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3"><Users className="h-5 w-5 text-primary" /></div>
            <div><p className="text-sm text-muted-foreground">New Hires (90 days)</p><p className="text-2xl font-bold">{employees.length}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-3"><CheckCircle className="h-5 w-5 text-emerald-600" /></div>
            <div><p className="text-sm text-muted-foreground">Completed</p><p className="text-2xl font-bold">0</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-3"><Clock className="h-5 w-5 text-amber-600" /></div>
            <div><p className="text-sm text-muted-foreground">In Progress</p><p className="text-2xl font-bold">{employees.length}</p></div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {employees.length === 0 ? (
          <Card><CardContent className="py-12 text-center"><Briefcase className="mx-auto h-12 w-12 text-muted-foreground/30" /><p className="mt-3 text-muted-foreground">No recent hires to onboard</p></CardContent></Card>
        ) : (
          employees.map((emp: any) => (
            <Card key={emp.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{emp.firstName} {emp.lastName}</h3>
                    <p className="text-sm text-muted-foreground">{emp.employeeId} | {emp.department?.name || "Unassigned"} | Joined: {formatDate(emp.dateOfJoining)}</p>
                  </div>
                  <Badge variant="warning">In Progress</Badge>
                </div>
                <Progress value={25} className="h-2 mb-3" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {checklistItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className={`h-3 w-3 rounded-full ${i < 2 ? "bg-emerald-500" : "bg-muted"}`} />
                      <span className={i < 2 ? "line-through text-muted-foreground" : ""}>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
