"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Building2, Shield, Bell, Mail, KeyRound, CheckCircle2 } from "lucide-react";

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  department: { name: string } | null;
}

export default function SettingsPage() {
  const [companySettings, setCompanySettings] = useState({
    companyName: "Omega Tv Media Pvt Ltd",
    tagline: "News India 24x7",
    email: "info@newsindia.tv",
    phone: "",
    address: "247/3, First Floor, D Block, Sector 63, Noida, UP 201301",
    website: "https://newsindia24x7.co",
    logoUrl: "/company-logo.jpeg",
    workingDaysPerMonth: 22,
    workingHoursPerDay: 8,
  });
  const [emailConfig, setEmailConfig] = useState({
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPass: "",
    senderEmail: "hr@newsindia.tv",
    senderName: "News India 24x7 HR",
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [resetEmployeeId, setResetEmployeeId] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("Welcome@123");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetResult, setResetResult] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setCompanySettings({
              companyName: data.companyName || "Omega Tv Media Pvt Ltd",
              tagline: data.tagline || "News India 24x7",
              email: data.email || "info@newsindia.tv",
              phone: data.phone || "",
              address: data.address || "",
              website: data.website || "",
              logoUrl: data.logoUrl || "/company-logo.jpeg",
              workingDaysPerMonth: data.workingDaysPerMonth || 22,
              workingHoursPerDay: data.workingHoursPerDay || 8,
            });
          }
        }
      } catch (e) { console.error(e); }
    };
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/employees?limit=200");
        if (res.ok) {
          const data = await res.json();
          setEmployees(data.employees || []);
        }
      } catch (e) { console.error(e); }
    };
    fetchSettings();
    fetchEmployees();
  }, []);

  const handleSaveCompany = async () => {
    setSaving(true);
    setSaveResult("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companySettings),
      });
      if (res.ok) setSaveResult("Settings saved successfully!");
      else setSaveResult("Failed to save settings");
    } catch { setSaveResult("Error saving settings"); }
    finally { setSaving(false); setTimeout(() => setSaveResult(""), 3000); }
  };

  const handleResetPassword = async () => {
    setResetLoading(true);
    setResetResult("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: resetEmployeeId, newPassword: resetNewPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetResult(data.message || "Password reset successfully!");
        setResetEmployeeId("");
        setResetNewPassword("Welcome@123");
      } else {
        setResetResult(data.error || "Failed to reset password");
      }
    } catch { setResetResult("Error resetting password"); }
    finally { setResetLoading(false); setShowResetConfirm(false); setTimeout(() => setResetResult(""), 5000); }
  };

  const selectedEmployee = employees.find((e) => e.id === resetEmployeeId);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Settings</h1><p className="text-sm text-muted-foreground">System configuration and preferences</p></div>

      <Tabs defaultValue="company">
        <TabsList className="flex-wrap">
          <TabsTrigger value="company"><Building2 className="mr-2 h-4 w-4" />Company</TabsTrigger>
          <TabsTrigger value="email"><Mail className="mr-2 h-4 w-4" />Email Config</TabsTrigger>
          <TabsTrigger value="password"><KeyRound className="mr-2 h-4 w-4" />Password Reset</TabsTrigger>
          <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4" />Security</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader><CardTitle>Company Information</CardTitle><CardDescription>Update company details used across the platform and in letters</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 flex items-center gap-4">
                <img src={companySettings.logoUrl || "/company-logo.jpeg"} alt="Logo" className="h-16 w-auto rounded-lg" />
                <div>
                  <p className="font-bold text-primary">{companySettings.companyName}</p>
                  <p className="text-sm text-muted-foreground">{companySettings.tagline}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Company Name</Label><Input value={companySettings.companyName} onChange={(e) => setCompanySettings({...companySettings, companyName: e.target.value})} /></div>
                <div className="space-y-2"><Label>Channel / Tagline</Label><Input value={companySettings.tagline} onChange={(e) => setCompanySettings({...companySettings, tagline: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Company Email</Label><Input value={companySettings.email} onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={companySettings.phone} onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})} /></div>
              </div>
              <div className="space-y-2"><Label>Website</Label><Input value={companySettings.website} onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})} /></div>
              <div className="space-y-2"><Label>Address</Label><Input value={companySettings.address} onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})} /></div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Working Days/Month</Label><Input type="number" value={companySettings.workingDaysPerMonth} onChange={(e) => setCompanySettings({...companySettings, workingDaysPerMonth: parseInt(e.target.value) || 22})} /></div>
                <div className="space-y-2"><Label>Working Hours/Day</Label><Input type="number" value={companySettings.workingHoursPerDay} onChange={(e) => setCompanySettings({...companySettings, workingHoursPerDay: parseInt(e.target.value) || 8})} /></div>
              </div>
              {saveResult && <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-700 dark:text-green-400 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{saveResult}</div>}
              <Button onClick={handleSaveCompany} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader><CardTitle>Email Configuration</CardTitle><CardDescription>Configure SMTP settings for sending emails (offer letters, notifications, etc.)</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-700 dark:text-blue-400">
                Configure your email server to send automated emails for offer letters, appointment letters, notifications, and other HR communications.
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>SMTP Host</Label><Input value={emailConfig.smtpHost} onChange={(e) => setEmailConfig({...emailConfig, smtpHost: e.target.value})} placeholder="e.g. smtp.gmail.com" /></div>
                <div className="space-y-2"><Label>SMTP Port</Label><Input value={emailConfig.smtpPort} onChange={(e) => setEmailConfig({...emailConfig, smtpPort: e.target.value})} placeholder="587" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>SMTP Username</Label><Input value={emailConfig.smtpUser} onChange={(e) => setEmailConfig({...emailConfig, smtpUser: e.target.value})} placeholder="your-email@domain.com" /></div>
                <div className="space-y-2"><Label>SMTP Password</Label><Input type="password" value={emailConfig.smtpPass} onChange={(e) => setEmailConfig({...emailConfig, smtpPass: e.target.value})} placeholder="App password" /></div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Sender Email</Label><Input value={emailConfig.senderEmail} onChange={(e) => setEmailConfig({...emailConfig, senderEmail: e.target.value})} placeholder="hr@newsindia.tv" /></div>
                <div className="space-y-2"><Label>Sender Name</Label><Input value={emailConfig.senderName} onChange={(e) => setEmailConfig({...emailConfig, senderName: e.target.value})} placeholder="News India 24x7 HR" /></div>
              </div>
              <Button>Save Email Configuration</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader><CardTitle>Employee Password Reset</CardTitle><CardDescription>Reset password for any employee. The employee will be required to change password on next login.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Employee</Label>
                <Select value={resetEmployeeId} onValueChange={setResetEmployeeId}>
                  <SelectTrigger><SelectValue placeholder="Choose employee to reset password" /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.employeeId}) - {emp.department?.name || "No Dept"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input value={resetNewPassword} onChange={(e) => setResetNewPassword(e.target.value)} placeholder="Default: Welcome@123" />
                <p className="text-xs text-muted-foreground">Leave as Welcome@123 for default. Employee will be forced to change on first login.</p>
              </div>
              {resetResult && (
                <div className={`rounded-md p-3 text-sm flex items-center gap-2 ${resetResult.includes("success") || resetResult.includes("reset") ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"}`}>
                  <CheckCircle2 className="h-4 w-4" />{resetResult}
                </div>
              )}
              <Button onClick={() => { if (resetEmployeeId) setShowResetConfirm(true); }} disabled={!resetEmployeeId || resetLoading} variant="destructive">
                {resetLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle>Security Settings</CardTitle><CardDescription>Configure authentication and access control</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><div><p className="font-medium">Two-Factor Authentication</p><p className="text-sm text-muted-foreground">Require 2FA for all admin users</p></div><Switch /></div>
              <Separator />
              <div className="flex items-center justify-between"><div><p className="font-medium">Force Password Change</p><p className="text-sm text-muted-foreground">New users must change password on first login</p></div><Switch defaultChecked /></div>
              <Separator />
              <div className="flex items-center justify-between"><div><p className="font-medium">Session Timeout</p><p className="text-sm text-muted-foreground">Auto logout after inactivity</p></div><Input type="number" defaultValue={24} className="w-20" /><span className="text-sm text-muted-foreground">hours</span></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle>Notification Preferences</CardTitle><CardDescription>Configure system notifications</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><div><p className="font-medium">Email Notifications</p><p className="text-sm text-muted-foreground">Send email for important events</p></div><Switch defaultChecked /></div>
              <Separator />
              <div className="flex items-center justify-between"><div><p className="font-medium">Leave Approval Alerts</p><p className="text-sm text-muted-foreground">Notify managers of pending leave requests</p></div><Switch defaultChecked /></div>
              <Separator />
              <div className="flex items-center justify-between"><div><p className="font-medium">Payroll Processing</p><p className="text-sm text-muted-foreground">Alert when payroll is generated</p></div><Switch defaultChecked /></div>
              <Separator />
              <div className="flex items-center justify-between"><div><p className="font-medium">Attendance Anomaly</p><p className="text-sm text-muted-foreground">Alert on unusual attendance patterns</p></div><Switch defaultChecked /></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Password Reset</DialogTitle></DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to reset the password for:</p>
            {selectedEmployee && (
              <div className="mt-2 rounded-lg bg-muted p-3">
                <p className="font-medium">{selectedEmployee.firstName} {selectedEmployee.lastName}</p>
                <p className="text-sm text-muted-foreground">ID: {selectedEmployee.employeeId} | {selectedEmployee.department?.name || "No Department"}</p>
              </div>
            )}
            <p className="mt-3 text-sm text-muted-foreground">New password: <strong>{resetNewPassword}</strong></p>
            <p className="text-sm text-muted-foreground">The employee will be required to change their password on next login.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleResetPassword} disabled={resetLoading}>
              {resetLoading ? "Resetting..." : "Confirm Reset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
