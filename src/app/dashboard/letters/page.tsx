"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollText, Plus, Eye, Printer, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  department: { name: string } | null;
  designation: { title: string } | null;
}

interface LetterDoc {
  id: string;
  name: string;
  type: string;
  category: string;
  content: string;
  createdAt: string;
  employee: { firstName: string; lastName: string; employeeId: string } | null;
}

export default function LettersPage() {
  const [letters, setLetters] = useState<LetterDoc[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ employeeId: "", letterType: "", reason: "", subject: "", description: "" });
  const printRef = useRef<HTMLDivElement>(null);

  const fetchLetters = async () => {
    try {
      const res = await fetch("/api/documents?category=OFFER_LETTER,APPOINTMENT,TERMINATION,WARNING");
      if (res.ok) {
        const data = await res.json();
        setLetters(Array.isArray(data) ? data : []);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees?limit=200");
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees || []);
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchLetters(); fetchEmployees(); }, []);

  const handleGenerate = async () => {
    if (!form.employeeId || !form.letterType) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewTitle(data.document.name);
        setPreviewContent(data.content);
        setShowGenerate(false);
        setShowPreview(true);
        setForm({ employeeId: "", letterType: "", reason: "", subject: "", description: "" });
        fetchLetters();
      }
    } catch (error) { console.error(error); }
    finally { setGenerating(false); }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>${previewTitle}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; border-bottom: 3px solid #7c3aed; padding-bottom: 20px; margin-bottom: 30px; }
          .header img { height: 80px; margin-bottom: 10px; }
          .header h1 { font-size: 18px; color: #7c3aed; margin: 5px 0; }
          .header p { font-size: 12px; color: #666; margin: 2px 0; }
          .content { white-space: pre-wrap; font-size: 14px; line-height: 1.8; }
          .footer { border-top: 2px solid #7c3aed; margin-top: 40px; padding-top: 15px; text-align: center; font-size: 11px; color: #666; }
          @media print { body { margin: 20px; } }
        </style></head><body>
        <div class="header">
          <img src="/company-logo.jpeg" alt="Logo" />
          <h1>OMEGA TV MEDIA PVT LTD</h1>
          <p>News India 24x7</p>
          <p>247/3, First Floor, D Block, Sector 63, Noida, UP 301301</p>
          <p>Email: info@newsindia.tv | HR: hr@newsindia.tv</p>
        </div>
        <div class="content">${previewContent}</div>
        <div class="footer">
          <p>This is a computer-generated document from RudraX HRMS</p>
          <p>Omega Tv Media Pvt Ltd | News India 24x7</p>
        </div>
        </body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const typeColor = (t: string) => {
    switch (t) {
      case "OFFER": case "OFFER_LETTER": return "default";
      case "APPOINTMENT": return "success";
      case "TERMINATION": return "destructive";
      case "WARNING": return "warning";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Letters & Templates</h1>
          <p className="text-sm text-muted-foreground">Generate offer, appointment, termination, and warning letters</p>
        </div>
        <Button onClick={() => setShowGenerate(true)}><Plus className="mr-2 h-4 w-4" />Generate Letter</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: "Offer Letters", type: "OFFER", icon: FileText, color: "bg-blue-500" },
          { label: "Appointment Letters", type: "APPOINTMENT", icon: ScrollText, color: "bg-green-500" },
          { label: "Termination Letters", type: "TERMINATION", icon: FileText, color: "bg-red-500" },
          { label: "Warning Letters", type: "WARNING", icon: FileText, color: "bg-yellow-500" },
        ].map((item) => (
          <Card key={item.type}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.color} text-white`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{letters.filter((l) => l.type === item.type || l.category === item.type || l.category === "OFFER_LETTER" && item.type === "OFFER").length}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generated Letters</CardTitle>
          <CardDescription>All letters generated for employees</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Letter Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {letters.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No letters generated yet. Click &quot;Generate Letter&quot; to create one.</TableCell></TableRow>
                ) : (
                  letters.map((letter) => (
                    <TableRow key={letter.id}>
                      <TableCell className="font-medium">{letter.name}</TableCell>
                      <TableCell><Badge variant={typeColor(letter.type)}>{letter.type}</Badge></TableCell>
                      <TableCell>{letter.employee ? `${letter.employee.firstName} ${letter.employee.lastName} (${letter.employee.employeeId})` : "-"}</TableCell>
                      <TableCell>{formatDate(letter.createdAt)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => { setPreviewTitle(letter.name); setPreviewContent(letter.content); setShowPreview(true); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Generate Letter</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Employee *</Label>
              <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
                <SelectTrigger><SelectValue placeholder="Choose employee" /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Letter Type *</Label>
              <Select value={form.letterType} onValueChange={(v) => setForm({ ...form, letterType: v })}>
                <SelectTrigger><SelectValue placeholder="Choose letter type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OFFER">Offer Letter</SelectItem>
                  <SelectItem value="APPOINTMENT">Appointment Letter</SelectItem>
                  <SelectItem value="TERMINATION">Termination Letter</SelectItem>
                  <SelectItem value="WARNING">Warning Letter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.letterType === "TERMINATION" && (
              <div className="space-y-2">
                <Label>Reason for Termination</Label>
                <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} placeholder="Enter reason..." />
              </div>
            )}
            {form.letterType === "WARNING" && (
              <>
                <div className="space-y-2">
                  <Label>Warning Subject</Label>
                  <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Attendance Issue" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe the issue..." />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerate(false)}>Cancel</Button>
            <Button onClick={handleGenerate} disabled={!form.employeeId || !form.letterType || generating}>
              {generating ? "Generating..." : "Generate Letter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{previewTitle}</DialogTitle>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />Print
              </Button>
            </div>
          </DialogHeader>
          <div ref={printRef} className="rounded-lg border bg-white p-8 text-black">
            <div className="mb-6 text-center border-b-2 border-purple-600 pb-4">
              <img src="/company-logo.jpeg" alt="Logo" className="mx-auto h-16 mb-2" />
              <h2 className="text-lg font-bold text-purple-700">OMEGA TV MEDIA PVT LTD</h2>
              <p className="text-sm text-gray-600">News India 24x7</p>
              <p className="text-xs text-gray-500">247/3, First Floor, D Block, Sector 63, Noida, UP 201301</p>
              <p className="text-xs text-gray-500">Email: info@newsindia.tv | HR: hr@newsindia.tv</p>
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{previewContent || "No content"}</div>
            <div className="mt-8 border-t-2 border-purple-600 pt-4 text-center text-xs text-gray-500">
              <p>This is a computer-generated document from RudraX HRMS</p>
              <p>Omega Tv Media Pvt Ltd | News India 24x7</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
