"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Account { id: number; code: string; name: string; type: string; balance: number }

export default function ChartOfAccountPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Account>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/chart-of-account");
        const data = await res.json();
        setAccounts(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load accounts");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveAccount = async () => {
    const payload: Account = {
      id: editingId ?? Math.max(0, ...accounts.map(a => a.id)) + 1,
      code: String(form.code ?? ""),
      name: String(form.name ?? "New Account"),
      type: String(form.type ?? "Asset"),
      balance: Number(form.balance ?? 0),
    };
    
    if (editingId) {
      setAccounts(prev => prev.map(a => a.id === editingId ? payload : a));
      await fetch("/api/chart-of-account", { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload) 
      });
    } else {
      setAccounts(prev => [payload, ...prev]);
      await fetch("/api/chart-of-account", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload) 
      });
    }
    
    setOpen(false);
    setEditingId(null);
    setForm({});
  };

  const onEdit = (account: Account) => {
    setForm(account);
    setEditingId(account.id);
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this account?")) return;
    setAccounts(prev => prev.filter(a => a.id !== id));
    await fetch(`/api/chart-of-account?id=${id}`, { method: "DELETE" });
  };

  if (loading) return <div>Loading accounts…</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const totalAssets = accounts.filter(a => a.type === "Asset").reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.type === "Liability").reduce((s, a) => s + a.balance, 0);
  const totalEquity = accounts.filter(a => a.type === "Equity").reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Chart of Account</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Manage your accounting structure and accounts</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); setForm({}); }}>New Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Account" : "Add Account"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="code">Account Code</Label>
                <Input id="code" value={form.code ?? ""} onChange={(e) => setForm(f => ({...f, code: e.target.value}))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Account Name</Label>
                <Input id="name" value={form.name ?? ""} onChange={(e) => setForm(f => ({...f, name: e.target.value}))} />
              </div>
              <div className="grid gap-2">
                <Label>Account Type</Label>
                <select value={form.type ?? "Asset"} onChange={(e) => setForm(f => ({...f, type: e.target.value}))} className="rounded-md border border-[var(--color-border)] bg-background px-3 py-2 text-sm">
                  <option value="Asset">Asset</option>
                  <option value="Liability">Liability</option>
                  <option value="Equity">Equity</option>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="balance">Balance</Label>
                <Input id="balance" type="number" value={form.balance ?? ""} onChange={(e) => setForm(f => ({...f, balance: Number(e.target.value)}))} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={saveAccount}>{editingId ? "Save Changes" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Assets</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">${totalAssets.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Liabilities</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">${totalLiabilities.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Equity</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">${totalEquity.toLocaleString()}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.code}</TableCell>
                  <TableCell>{a.name}</TableCell>
                  <TableCell>{a.type}</TableCell>
                  <TableCell className="text-right">${a.balance.toLocaleString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(a)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(a.id)}>Delete</Button>
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