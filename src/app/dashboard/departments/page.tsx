"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Plus, Users } from "lucide-react";

interface Department { id: string; name: string; code: string; description: string; isActive: boolean; _count: { employees: number }; }

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", description: "" });

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments");
      if (res.ok) setDepartments(await res.json());
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleAdd = async () => {
    try {
      const res = await fetch("/api/departments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { setShowAdd(false); setForm({ name: "", code: "", description: "" }); fetchDepartments(); }
    } catch (error) { console.error(error); }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Departments</h1><p className="text-sm text-muted-foreground">Manage organizational departments</p></div>
        <Button onClick={() => setShowAdd(true)}><Plus className="mr-2 h-4 w-4" />Add Department</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <Card key={dept.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3"><Building2 className="h-5 w-5 text-primary" /></div>
                  <div>
                    <h3 className="font-semibold">{dept.name}</h3>
                    <Badge variant="outline" className="mt-1">{dept.code}</Badge>
                  </div>
                </div>
              </div>
              {dept.description && <p className="mt-3 text-sm text-muted-foreground">{dept.description}</p>}
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" /><span>{dept._count.employees} employees</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Department</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Code *</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g., HR, ENG" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.name || !form.code}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
