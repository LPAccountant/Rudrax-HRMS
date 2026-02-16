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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Download, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Document {
  id: string; name: string; type: string; category: string; content: string; isTemplate: boolean; version: number; createdAt: string;
  employee: { firstName: string; lastName: string; employeeId: string } | null;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [form, setForm] = useState({ name: "", type: "GENERAL", category: "OTHER", content: "", isTemplate: false });

  const fetchDocuments = async () => {
    try {
      const [docRes, tmplRes] = await Promise.all([fetch("/api/documents"), fetch("/api/documents?isTemplate=true")]);
      if (docRes.ok) setDocuments(await docRes.json());
      if (tmplRes.ok) setTemplates(await tmplRes.json());
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const handleAdd = async () => {
    try {
      const res = await fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { setShowAdd(false); setForm({ name: "", type: "GENERAL", category: "OTHER", content: "", isTemplate: false }); fetchDocuments(); }
    } catch (error) { console.error(error); }
  };

  const categoryColor = (c: string) => {
    switch (c) { case "OFFER_LETTER": return "default"; case "APPOINTMENT": return "success"; case "SALARY_SLIP": return "warning"; case "ID_PROOF": return "secondary"; default: return "outline"; }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Documents</h1><p className="text-sm text-muted-foreground">Manage HR documents and templates</p></div>
        <Button onClick={() => setShowAdd(true)}><Plus className="mr-2 h-4 w-4" />Add Document</Button>
      </div>

      <Tabs defaultValue="documents">
        <TabsList><TabsTrigger value="documents">Documents</TabsTrigger><TabsTrigger value="templates">Templates</TabsTrigger></TabsList>
        <TabsContent value="documents">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Employee</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {documents.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No documents found</TableCell></TableRow>
                  ) : (
                    documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{doc.name}</span></div></TableCell>
                        <TableCell><Badge variant={categoryColor(doc.category)}>{doc.category.replace(/_/g, " ")}</Badge></TableCell>
                        <TableCell>{doc.employee ? `${doc.employee.firstName} ${doc.employee.lastName}` : "-"}</TableCell>
                        <TableCell>{formatDate(doc.createdAt)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => { setPreviewTitle(doc.name); setPreviewContent(doc.content); setShowPreview(true); }}><Eye className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="templates">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader><TableRow><TableHead>Template Name</TableHead><TableHead>Type</TableHead><TableHead>Version</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {templates.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No templates found</TableCell></TableRow>
                  ) : (
                    templates.map((tmpl) => (
                      <TableRow key={tmpl.id}>
                        <TableCell className="font-medium">{tmpl.name}</TableCell>
                        <TableCell><Badge variant="outline">{tmpl.type}</Badge></TableCell>
                        <TableCell>v{tmpl.version}</TableCell>
                        <TableCell>{formatDate(tmpl.createdAt)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => { setPreviewTitle(tmpl.name); setPreviewContent(tmpl.content); setShowPreview(true); }}><Eye className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Add Document</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OTHER">Other</SelectItem><SelectItem value="OFFER_LETTER">Offer Letter</SelectItem>
                    <SelectItem value="APPOINTMENT">Appointment Letter</SelectItem><SelectItem value="SALARY_SLIP">Salary Slip</SelectItem>
                    <SelectItem value="ID_PROOF">ID Proof</SelectItem><SelectItem value="CERTIFICATE">Certificate</SelectItem>
                    <SelectItem value="POLICY">Policy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isTemplate} onChange={(e) => setForm({ ...form, isTemplate: e.target.checked })} className="rounded" />
                  Save as Template
                </label>
              </div>
            </div>
            <div className="space-y-2"><Label>Content</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} placeholder="Enter document content..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button><Button onClick={handleAdd} disabled={!form.name}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{previewTitle}</DialogTitle></DialogHeader>
          <div className="rounded-lg border bg-muted/30 p-6">
            <div className="mb-4 text-center border-b pb-4">
              <h2 className="text-xl font-bold text-primary">RudraX HRMS</h2>
              <p className="text-xs text-muted-foreground">A Product by Lalit Pandit</p>
            </div>
            <div className="whitespace-pre-wrap text-sm">{previewContent || "No content available"}</div>
            <div className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground">
              Generated by RudraX HRMS | Confidential
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
