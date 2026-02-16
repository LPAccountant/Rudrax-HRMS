"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Building2, Shield, Bell, Palette } from "lucide-react";

export default function SettingsPage() {
  const [companySettings, setCompanySettings] = useState({
    companyName: "RudraX HRMS",
    tagline: "A Product by Lalit Pandit",
    email: "lalittheonly@gmail.com",
    phone: "",
    address: "",
    website: "https://newsindia24x7.co",
    workingDaysPerMonth: 22,
    workingHoursPerDay: 8,
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Settings</h1><p className="text-sm text-muted-foreground">System configuration and preferences</p></div>

      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company"><Building2 className="mr-2 h-4 w-4" />Company</TabsTrigger>
          <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4" />Security</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />Notifications</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" />Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader><CardTitle>Company Information</CardTitle><CardDescription>Update your company details used across the platform</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Company Name</Label><Input value={companySettings.companyName} onChange={(e) => setCompanySettings({...companySettings, companyName: e.target.value})} /></div>
                <div className="space-y-2"><Label>Tagline</Label><Input value={companySettings.tagline} onChange={(e) => setCompanySettings({...companySettings, tagline: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Email</Label><Input value={companySettings.email} onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={companySettings.phone} onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})} /></div>
              </div>
              <div className="space-y-2"><Label>Website</Label><Input value={companySettings.website} onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})} /></div>
              <div className="space-y-2"><Label>Address</Label><Input value={companySettings.address} onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})} /></div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Working Days/Month</Label><Input type="number" value={companySettings.workingDaysPerMonth} onChange={(e) => setCompanySettings({...companySettings, workingDaysPerMonth: parseInt(e.target.value)})} /></div>
                <div className="space-y-2"><Label>Working Hours/Day</Label><Input type="number" value={companySettings.workingHoursPerDay} onChange={(e) => setCompanySettings({...companySettings, workingHoursPerDay: parseInt(e.target.value)})} /></div>
              </div>
              <Button>Save Changes</Button>
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

        <TabsContent value="appearance">
          <Card>
            <CardHeader><CardTitle>Appearance</CardTitle><CardDescription>Customize the look and feel</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><div><p className="font-medium">Dark Mode</p><p className="text-sm text-muted-foreground">Toggle between light and dark themes</p></div><Switch /></div>
              <Separator />
              <div className="space-y-2"><Label>Primary Color</Label><div className="flex gap-3">{["#7c3aed", "#2563eb", "#059669", "#dc2626", "#d97706", "#7c3aed"].map((c) => (<button key={c} className="h-8 w-8 rounded-full border-2 border-transparent hover:border-foreground" style={{ backgroundColor: c }} />))}</div></div>
              <Separator />
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium">Branding Preview</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary"><span className="text-sm font-bold text-primary-foreground">R</span></div>
                  <div><p className="font-bold text-primary">RudraX HRMS</p><p className="text-xs text-muted-foreground">A Product by Lalit Pandit</p></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
