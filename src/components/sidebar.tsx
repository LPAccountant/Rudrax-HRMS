"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Clock, CalendarDays, DollarSign,
  FileText, Bell, AlertTriangle, LogOut, Settings, Shield,
  ChevronLeft, ChevronRight, Building2, Briefcase
} from "lucide-react";

interface SidebarProps {
  userRole: string;
}

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"] },
  { href: "/dashboard/employees", label: "Employees", icon: Users, roles: ["ADMIN", "HR", "MANAGER"] },
  { href: "/dashboard/departments", label: "Departments", icon: Building2, roles: ["ADMIN", "HR"] },
  { href: "/dashboard/attendance", label: "Attendance", icon: Clock, roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"] },
  { href: "/dashboard/leave", label: "Leave", icon: CalendarDays, roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"] },
  { href: "/dashboard/payroll", label: "Payroll", icon: DollarSign, roles: ["ADMIN", "HR"] },
  { href: "/dashboard/documents", label: "Documents", icon: FileText, roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"] },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell, roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"] },
  { href: "/dashboard/warnings", label: "Warnings", icon: AlertTriangle, roles: ["ADMIN", "HR", "MANAGER"] },
  { href: "/dashboard/onboarding", label: "Onboarding", icon: Briefcase, roles: ["ADMIN", "HR"] },
  { href: "/dashboard/exit", label: "Exit Process", icon: LogOut, roles: ["ADMIN", "HR"] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["ADMIN"] },
  { href: "/dashboard/audit-logs", label: "Audit Logs", icon: Shield, roles: ["ADMIN"] },
];

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = menuItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">R</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-primary">RudraX HRMS</h1>
              <p className="text-[10px] text-muted-foreground">by Lalit Pandit</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">R</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden rounded-md p-1 hover:bg-accent lg:block"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2 scrollbar-thin">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        {!collapsed && (
          <div className="rounded-md bg-primary/10 p-3">
            <p className="text-xs font-medium text-primary">RudraX HRMS v1.0</p>
            <p className="text-[10px] text-muted-foreground">Enterprise Edition</p>
          </div>
        )}
      </div>
    </aside>
  );
}
