"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Tax { id: number; name: string; rate: number; type: string; description: string }

export default function TaxCenterPage() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Tax>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/tax-center");
        const data = await res.json();
        setTaxes(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load taxes");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveTax = async () => {
    const payload: Tax = {
      id: editingId ?? Math.max(0, ...taxes.map(t => t.id)) + 1,
      name: String(form.name ?? "New Tax"),
      rate: Number(form.rate ?? 0),
      type: String(form.type ?? "Output"),
      description: String(form.description ?? ""),
    };
    
    if (editingId) {
      setTaxes(prev => prev.map(t => t.id === editingId ? payload : t));
      await fetch("/api/tax-center", { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload) 
      });
    } else {
      setTaxes(prev => [payload, ...prev]);
      await fetch("/api/tax-center", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload) 
      });
    }
    
    setOpen(false);
    setEditingId(null);
    setForm({});
  };

  const onEdit = (tax: Tax) => {
    setForm(tax);
    setEditingId(tax.id);
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this tax?")) return;
    setTaxes(prev => prev.filter(t => t.id !== id));
    await fetch(`/api/tax-center?id=${id}`, { method: "DELETE" });
  };

  if (loading) return <div>Loading taxes…</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const outputTaxes = taxes.filter(t => t.type === "Output");
  const inputTaxes = taxes.filter(t => t.type === "Input");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Tax Center</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Manage tax rates, categories, and compliance</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); setForm({}); }}>New Tax</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Tax" : "Add Tax"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Tax Name</Label>
                <Input id="name" value={form.name ?? ""} onChange={(e) => setForm(f => ({...f, name: e.target.value}))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rate">Rate (%)</Label>
                <Input id="rate" type="number" step="0.1" value={form.rate ?? ""} onChange={(e) => setForm(f => ({...f, rate: Number(e.target.value)}))} />
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <select value={form.type ?? "Output"} onChange={(e) => setForm(f => ({...f, type: e.target.value}))} className="rounded-md border border-[var(--color-border)] bg-background px-3 py-2 text-sm">
                  <option value="Output">Output (Sales Tax)</option>
                  <option value="Input">Input (Purchase Tax)</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={form.description ?? ""} onChange={(e) => setForm(f => ({...f, description: e.target.value}))} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={saveTax}>{editingId ? "Save Changes" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total Taxes</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{taxes.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Output Taxes</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{outputTaxes.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Input Taxes</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{inputTaxes.length}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tax Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Rate (%)</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxes.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-right">{t.rate}%</TableCell>
                  <TableCell>{t.type}</TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(t)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(t.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}