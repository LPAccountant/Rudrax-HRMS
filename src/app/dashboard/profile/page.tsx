"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { User, Building2, CreditCard, Shield } from "lucide-react";
import { getInitials, formatDate, formatCurrency } from "@/lib/utils";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const me = await meRes.json();
          if (me.employee) {
            const empRes = await fetch(`/api/employees/${me.employee.id}`);
            if (empRes.ok) setProfile(await empRes.json());
          }
        }
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!profile) return <div className="p-6">Profile not found</div>;

  const name = `${profile.firstName} ${profile.lastName}`;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{name}</h1>
              <p className="text-muted-foreground">{profile.designation?.title || "Employee"} | {profile.department?.name || "Unassigned"}</p>
              <div className="mt-2 flex gap-2">
                <Badge variant="outline">{profile.employeeId}</Badge>
                <Badge variant="success">{profile.status}</Badge>
                <Badge variant="secondary">{profile.user?.role}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal"><User className="mr-2 h-4 w-4" />Personal</TabsTrigger>
          <TabsTrigger value="work"><Building2 className="mr-2 h-4 w-4" />Work</TabsTrigger>
          <TabsTrigger value="financial"><CreditCard className="mr-2 h-4 w-4" />Financial</TabsTrigger>
          <TabsTrigger value="leaves"><Shield className="mr-2 h-4 w-4" />Leave Balance</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{profile.email}</p></div>
                <div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{profile.phone || "-"}</p></div>
                <div><p className="text-sm text-muted-foreground">Gender</p><p className="font-medium">{profile.gender || "-"}</p></div>
                <div><p className="text-sm text-muted-foreground">Date of Birth</p><p className="font-medium">{profile.dateOfBirth ? formatDate(profile.dateOfBirth) : "-"}</p></div>
                <div><p className="text-sm text-muted-foreground">Address</p><p className="font-medium">{profile.address || "-"}</p></div>
                <div><p className="text-sm text-muted-foreground">City</p><p className="font-medium">{profile.city || "-"}</p></div>
                <div><p className="text-sm text-muted-foreground">State</p><p className="font-medium">{profile.state || "-"}</p></div>
                <div><p className="text-sm text-muted-foreground">Country</p><p className="font-medium">{profile.country || "-"}</p></div>
              </div>
              <Separator />
              <div><p className="text-sm font-medium mb-2">Emergency Contact</p>
                <div className="grid grid-cols-3 gap-4">
                  <div><p className="text-sm text-muted-foreground">Name</p><p className="font-medium">{profile.emergencyName || "-"}</p></div>
                  <div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{profile.emergencyPhone || "-"}</p></div>
                  <div><p className="text-sm text-muted-foreground">Relation</p><p className="font-medium">{profile.emergencyRelation || "-"}</p></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work">
          <Card>
            <CardContent className="p-6 grid grid-cols-2 gap-4">
              <div><p className="text-sm text-muted-foreground">Department</p><p className="font-medium">{profile.department?.name || "-"}</p></div>
              <div><p className="text-sm text-muted-foreground">Designation</p><p className="font-medium">{profile.designation?.title || "-"}</p></div>
              <div><p className="text-sm text-muted-foreground">Employment Type</p><p className="font-medium">{profile.employmentType?.replace("_", " ") || "-"}</p></div>
              <div><p className="text-sm text-muted-foreground">Date of Joining</p><p className="font-medium">{formatDate(profile.dateOfJoining)}</p></div>
              <div><p className="text-sm text-muted-foreground">Manager</p><p className="font-medium">{profile.manager ? `${profile.manager.firstName} ${profile.manager.lastName}` : "-"}</p></div>
              <div><p className="text-sm text-muted-foreground">Role</p><p className="font-medium">{profile.user?.role || "-"}</p></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardContent className="p-6 grid grid-cols-2 gap-4">
              <div><p className="text-sm text-muted-foreground">Bank Name</p><p className="font-medium">{profile.bankName || "-"}</p></div>
              <div><p className="text-sm text-muted-foreground">Account Number</p><p className="font-medium">{profile.bankAccount || "-"}</p></div>
              <div><p className="text-sm text-muted-foreground">IFSC Code</p><p className="font-medium">{profile.ifscCode || "-"}</p></div>
              <div><p className="text-sm text-muted-foreground">PAN Number</p><p className="font-medium">{profile.panNumber || "-"}</p></div>
              <div><p className="text-sm text-muted-foreground">Aadhar Number</p><p className="font-medium">{profile.aadharNumber || "-"}</p></div>
              <div><p className="text-sm text-muted-foreground">UAN Number</p><p className="font-medium">{profile.uanNumber || "-"}</p></div>
              {profile.salaryStructure && (
                <>
                  <Separator className="col-span-2" />
                  <div><p className="text-sm text-muted-foreground">Gross Salary</p><p className="font-medium">{formatCurrency(profile.salaryStructure.grossSalary)}</p></div>
                  <div><p className="text-sm text-muted-foreground">Net Salary</p><p className="font-medium text-primary">{formatCurrency(profile.salaryStructure.netSalary)}</p></div>
                  <div><p className="text-sm text-muted-foreground">CTC</p><p className="font-medium">{formatCurrency(profile.salaryStructure.ctc)}</p></div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves">
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {profile.leaveBalances?.map((bal: any) => (
                  <div key={bal.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{bal.leaveType.name}</h4>
                      <Badge variant="outline">{bal.leaveType.code}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div><p className="text-lg font-bold text-primary">{bal.allocated}</p><p className="text-xs text-muted-foreground">Allocated</p></div>
                      <div><p className="text-lg font-bold text-destructive">{bal.used}</p><p className="text-xs text-muted-foreground">Used</p></div>
                      <div><p className="text-lg font-bold text-emerald-600">{bal.remaining}</p><p className="text-xs text-muted-foreground">Remaining</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
