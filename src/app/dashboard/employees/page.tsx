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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { getInitials, formatDate } from "@/lib/utils";

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  status: string;
  employmentType: string;
  dateOfJoining: string;
  department: { id: string; name: string } | null;
  designation: { id: string; title: string } | null;
  user: { email: string; role: string; isActive: boolean };
}

interface Department { id: string; name: string; code: string; }
interface Designation { id: string; title: string; }

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", gender: "", departmentId: "", designationId: "", employmentType: "FULL_TIME", role: "EMPLOYEE", dateOfJoining: new Date().toISOString().split("T")[0] });

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`/api/employees?search=${search}`);
      if (res.ok) { const data = await res.json(); setEmployees(data.employees); }
    } catch (error) { console.error("Failed to fetch employees:", error); }
    finally { setLoading(false); }
  };

  const fetchMeta = async () => {
    const [dRes, desRes] = await Promise.all([fetch("/api/departments"), fetch("/api/designations")]);
    if (dRes.ok) setDepartments(await dRes.json());
    if (desRes.ok) setDesignations(await desRes.json());
  };

  useEffect(() => { fetchEmployees(); fetchMeta(); }, []);
  useEffect(() => { const timer = setTimeout(fetchEmployees, 300); return () => clearTimeout(timer); }, [search]);

  const handleAdd = async () => {
    try {
      const res = await fetch("/api/employees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) {
        setShowAdd(false);
        setForm({ firstName: "", lastName: "", email: "", phone: "", gender: "", departmentId: "", designationId: "", employmentType: "FULL_TIME", role: "EMPLOYEE", dateOfJoining: new Date().toISOString().split("T")[0] });
        fetchEmployees();
      }
    } catch (error) { console.error("Failed to add employee:", error); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this employee?")) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      if (res.ok) fetchEmployees();
    } catch (error) { console.error("Failed to delete employee:", error); }
  };

  const statusColor = (s: string) => {
    switch (s) { case "ACTIVE": return "success"; case "INACTIVE": return "destructive"; case "ON_LEAVE": return "warning"; default: return "secondary"; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-sm text-muted-foreground">Manage employee profiles and records</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><UserPlus className="mr-2 h-4 w-4" />Add Employee</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No employees found</TableCell></TableRow>
                ) : (
                  employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground text-xs">{getInitials(`${emp.firstName} ${emp.lastName}`)}</AvatarFallback></Avatar>
                          <div>
                            <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-muted-foreground">{emp.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{emp.employeeId}</Badge></TableCell>
                      <TableCell>{emp.department?.name || "-"}</TableCell>
                      <TableCell>{emp.designation?.title || "-"}</TableCell>
                      <TableCell><Badge variant={statusColor(emp.status)}>{emp.status}</Badge></TableCell>
                      <TableCell>{formatDate(emp.dateOfJoining)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedEmployee(emp); setShowView(true); }}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(emp.id)}><Trash2 className="h-4 w-4" /></Button>
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

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add New Employee</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>First Name *</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Last Name *</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Date of Joining</Label><Input type="date" value={form.dateOfJoining} onChange={(e) => setForm({ ...form, dateOfJoining: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.departmentId} onValueChange={(v) => setForm({ ...form, departmentId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Designation</Label>
                <Select value={form.designationId} onValueChange={(v) => setForm({ ...form, designationId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select designation" /></SelectTrigger>
                  <SelectContent>{designations.map((d) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <Select value={form.employmentType} onValueChange={(v) => setForm({ ...form, employmentType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                    <SelectItem value="INTERN">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.firstName || !form.lastName || !form.email}>Add Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showView} onOpenChange={setShowView}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Employee Details</DialogTitle></DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16"><AvatarFallback className="bg-primary text-primary-foreground text-lg">{getInitials(`${selectedEmployee.firstName} ${selectedEmployee.lastName}`)}</AvatarFallback></Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.employeeId}</p>
                  <Badge variant={statusColor(selectedEmployee.status)}>{selectedEmployee.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Email:</span><p className="font-medium">{selectedEmployee.email}</p></div>
                <div><span className="text-muted-foreground">Phone:</span><p className="font-medium">{selectedEmployee.phone || "-"}</p></div>
                <div><span className="text-muted-foreground">Department:</span><p className="font-medium">{selectedEmployee.department?.name || "-"}</p></div>
                <div><span className="text-muted-foreground">Designation:</span><p className="font-medium">{selectedEmployee.designation?.title || "-"}</p></div>
                <div><span className="text-muted-foreground">Joined:</span><p className="font-medium">{formatDate(selectedEmployee.dateOfJoining)}</p></div>
                <div><span className="text-muted-foreground">Type:</span><p className="font-medium">{selectedEmployee.employmentType.replace("_", " ")}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
