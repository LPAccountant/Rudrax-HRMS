"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, CalendarDays, DollarSign, TrendingUp, UserPlus } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  todayPresent: number;
  pendingLeaves: number;
  departmentStats: { name: string; employees: number }[];
  recentHires: { firstName: string; lastName: string; employeeId: string; dateOfJoining: string; department: { name: string } | null }[];
  payrollSummary: { totalNetSalary: number; totalGross: number; totalDeductions: number; processedCount: number };
  attendanceTrend: { month: string; present: number }[];
}

const COLORS = ["#7c3aed", "#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!stats) return <div className="p-6">Failed to load dashboard data.</div>;

  const statCards = [
    { title: "Total Employees", value: stats.totalEmployees, icon: Users, color: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-900/30" },
    { title: "Present Today", value: stats.todayPresent, icon: Clock, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
    { title: "Pending Leaves", value: stats.pendingLeaves, icon: CalendarDays, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
    { title: "Monthly Payroll", value: formatCurrency(stats.payrollSummary.totalNetSalary), icon: DollarSign, color: "text-cyan-600", bg: "bg-cyan-100 dark:bg-cyan-900/30" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">RudraX HRMS Overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="mt-1 text-2xl font-bold">{card.value}</p>
                </div>
                <div className={`rounded-lg p-3 ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Attendance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="present" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Department Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.departmentStats.filter((d) => d.employees > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="employees"
                    label={({ name, employees }) => `${name}: ${employees}`}
                  >
                    {stats.departmentStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4" />
              Recent Hires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentHires.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent hires</p>
              ) : (
                stats.recentHires.map((hire) => (
                  <div key={hire.employeeId} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{hire.firstName} {hire.lastName}</p>
                      <p className="text-xs text-muted-foreground">{hire.department?.name || "Unassigned"}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-xs">{hire.employeeId}</Badge>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(hire.dateOfJoining)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4" />
              Payroll Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">Gross Earnings</span>
                <span className="font-semibold">{formatCurrency(stats.payrollSummary.totalGross)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">Total Deductions</span>
                <span className="font-semibold text-destructive">{formatCurrency(stats.payrollSummary.totalDeductions)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3">
                <span className="text-sm font-medium">Net Payroll</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(stats.payrollSummary.totalNetSalary)}</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {stats.payrollSummary.processedCount} employees processed this month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-xs text-muted-foreground py-4">
        RudraX HRMS &copy; {new Date().getFullYear()} | A Product by Lalit Pandit
      </div>
    </div>
  );
}
