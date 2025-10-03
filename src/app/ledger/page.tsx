"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRole } from "@/hooks/useRole";

interface LedgerItem {
  id: number;
  type: "order" | "payment" | "expense" | "misc";
  ref: string;
  description: string;
  amount: number; // positive for income, negative for expense
  date: string;
}

export default function LedgerPage() {
  const { can } = useRole();
  const [items, setItems] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "payment", ref: "", description: "", amount: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  const income = useMemo(() => items.filter(i => i.amount > 0).reduce((s, i) => s + i.amount, 0), [items]);
  const expense = useMemo(() => items.filter(i => i.amount < 0).reduce((s, i) => s + Math.abs(i.amount), 0), [items]);
  const net = useMemo(() => income - expense, [income, expense]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/ledger");
      const data = await res.json();
      setItems(data);
      setLoading(false);
    };
    load();
  }, []);

  const saveItem = async () => {
    const payload = {
      id: editingId ?? Math.max(0, ...items.map(i => i.id)) + 1,
      type: form.type,
      ref: form.ref || `REF-${Math.floor(Math.random() * 10000)}`,
      description: form.description,
      amount: Number(form.amount) || 0,
      date: new Date().toISOString(),
    };

    if (editingId) {
      setItems(prev => prev.map(i => i.id === editingId ? payload : i));
      await fetch("/api/ledger", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      setItems(prev => [payload, ...prev]);
      await fetch("/api/ledger", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    
    setOpen(false);
    setEditingId(null);
    setForm({ type: "payment", ref: "", description: "", amount: "" });
  };

  const onEdit = (item: LedgerItem) => {
    setForm({ type: item.type, ref: item.ref, description: item.description, amount: String(item.amount) });
    setEditingId(item.id);
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this ledger entry?")) return;
    setItems(prev => prev.filter(i => i.id !== id));
    await fetch(`/api/ledger?id=${id}`, { method: "DELETE" });
  };

  if (loading) return <div>Loading ledger…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ledger</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Record of all financial transactions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); setForm({ type: "payment", ref: "", description: "", amount: "" }); }} disabled={!can.create}>Add Entry</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Entry" : "Add Entry"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Type</Label>
                <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))} className="rounded-md border border-[var(--color-border)] bg-background px-3 py-2 text-sm">
                  <option value="order">Order</option>
                  <option value="payment">Payment</option>
                  <option value="expense">Expense</option>
                  <option value="misc">Misc</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ref">Reference</Label>
                <Input id="ref" placeholder="Reference" value={form.ref} onChange={(e) => setForm(f => ({ ...f, ref: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (positive for income, negative for expense)</Label>
                <Input id="amount" type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={saveItem}>{editingId ? "Save Changes" : "Add"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Income</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">${income.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Expenses</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">${expense.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Net</CardTitle></CardHeader>
          <CardContent className={`text-2xl font-bold ${net >= 0 ? "text-green-600" : "text-red-600"}`}>${net.toFixed(2)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Ref</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>{new Date(i.date).toLocaleDateString()}</TableCell>
                  <TableCell className="capitalize">{i.type}</TableCell>
                  <TableCell>{i.ref}</TableCell>
                  <TableCell>{i.description}</TableCell>
                  <TableCell className={`text-right ${i.amount >= 0 ? "text-green-600" : "text-red-600"}`}>${i.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(i)} disabled={!can.update}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(i.id)} disabled={!can.delete}>Delete</Button>
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