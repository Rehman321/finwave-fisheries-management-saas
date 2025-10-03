"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRole } from "@/hooks/useRole";
import { AlertCircle, Bell, Calendar, TrendingUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Cheque {
  id: number;
  chequeNo: string;
  client: string;
  amount: number;
  dueDate: string;
  status: "pending" | "cleared" | "bounced";
}

export default function PdcPage() {
  const { can } = useRole();
  const [items, setItems] = useState<Cheque[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ chequeNo: "", client: "", amount: "", dueDate: "", status: "pending" as Cheque["status"] });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/pdc");
      const data = await res.json();
      setItems(data);
      setLoading(false);
    };
    load();
  }, []);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return items.filter(c => c.status === "pending" && new Date(c.dueDate).getTime() >= now).slice(0, 5);
  }, [items]);

  // Calculate urgent cheques (due within 7 days)
  const urgentCheques = useMemo(() => {
    const now = Date.now();
    const sevenDaysFromNow = now + (7 * 24 * 60 * 60 * 1000);
    return items.filter(c => {
      const dueTime = new Date(c.dueDate).getTime();
      return c.status === "pending" && dueTime >= now && dueTime <= sevenDaysFromNow;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [items]);

  // Calculate days until due
  const getDaysUntilDue = (dueDate: string) => {
    const now = Date.now();
    const due = new Date(dueDate).getTime();
    const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Get urgency level for styling
  const getUrgencyLevel = (dueDate: string) => {
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return "overdue";
    if (days <= 2) return "critical";
    if (days <= 7) return "warning";
    return "normal";
  };

  const totals = useMemo(() => {
    return {
      pending: items.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0),
      cleared: items.filter(i => i.status === "cleared").reduce((s, i) => s + i.amount, 0),
      bounced: items.filter(i => i.status === "bounced").reduce((s, i) => s + i.amount, 0),
    };
  }, [items]);

  const saveCheque = async () => {
    const payload = {
      id: editingId ?? Math.max(0, ...items.map(i => i.id)) + 1,
      chequeNo: form.chequeNo || `CHQ-${Math.floor(Math.random() * 9999).toString().padStart(4, "0")}`,
      client: form.client,
      amount: Number(form.amount) || 0,
      dueDate: form.dueDate,
      status: form.status
    };

    if (editingId) {
      setItems(prev => prev.map(i => i.id === editingId ? payload : i));
      await fetch("/api/pdc", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      setItems(prev => [payload, ...prev]);
      await fetch("/api/pdc", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    
    setOpen(false);
    setEditingId(null);
    setForm({ chequeNo: "", client: "", amount: "", dueDate: "", status: "pending" });
  };

  const onEdit = (cheque: Cheque) => {
    setForm({ chequeNo: cheque.chequeNo, client: cheque.client, amount: String(cheque.amount), dueDate: cheque.dueDate, status: cheque.status });
    setEditingId(cheque.id);
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this cheque?")) return;
    setItems(prev => prev.filter(i => i.id !== id));
    await fetch(`/api/pdc?id=${id}`, { method: "DELETE" });
  };

  const updateStatus = async (id: number, status: Cheque["status"]) => {
    const res = await fetch("/api/pdc", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (res.ok) {
      const updated = await res.json();
      setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
    }
  };

  if (loading) return <div>Loading cheques…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Post-Dated Cheques (PDC)</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Log and track cheque settlements</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); setForm({ chequeNo: "", client: "", amount: "", dueDate: "", status: "pending" }); }} disabled={!can.create}>Add Cheque</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Cheque" : "Add Cheque"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="chequeNo">Cheque No</Label>
                <Input id="chequeNo" placeholder="Cheque No" value={form.chequeNo} onChange={(e) => setForm(f => ({ ...f, chequeNo: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client">Client</Label>
                <Input id="client" placeholder="Client" value={form.client} onChange={(e) => setForm(f => ({ ...f, client: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" placeholder="Due Date" value={form.dueDate} onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <select className="rounded-md border border-[var(--color-border)] bg-background px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))}>
                  <option value="pending">Pending</option>
                  <option value="cleared">Cleared</option>
                  <option value="bounced">Bounced</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={saveCheque}>{editingId ? "Save Changes" : "Add"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Urgent Cheques Notification */}
      {urgentCheques.length > 0 && (
        <Alert className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
          <Bell className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900 dark:text-orange-100">
            {urgentCheques.length} {urgentCheques.length === 1 ? 'Cheque' : 'Cheques'} Due Within 7 Days
          </AlertTitle>
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <div className="mt-2 space-y-2">
              {urgentCheques.slice(0, 3).map(c => {
                const days = getDaysUntilDue(c.dueDate);
                return (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span className="font-medium">{c.chequeNo}</span>
                      <span>- {c.client}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">${c.amount.toFixed(2)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        days <= 2 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 
                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                      }`}>
                        {days === 0 ? 'Due Today' : days === 1 ? 'Due Tomorrow' : `${days} days`}
                      </span>
                    </div>
                  </div>
                );
              })}
              {urgentCheques.length > 3 && (
                <div className="text-xs text-orange-700 dark:text-orange-300 mt-2">
                  + {urgentCheques.length - 3} more upcoming cheques
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Pending</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">${totals.pending.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Cleared</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">${totals.cleared.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Bounced</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">${totals.bounced.toFixed(2)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Upcoming (next)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {upcoming.length === 0 && <div className="text-sm text-[var(--color-muted-foreground)]">No upcoming cheques</div>}
            {upcoming.map(c => {
              const urgency = getUrgencyLevel(c.dueDate);
              const days = getDaysUntilDue(c.dueDate);
              return (
                <div key={c.id} className={`flex items-center justify-between rounded-md border p-2 text-sm ${
                  urgency === 'critical' ? 'border-red-300 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20' :
                  urgency === 'warning' ? 'border-orange-300 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/20' :
                  'border-[var(--color-border)]'
                }`}>
                  <div className="flex items-center gap-3">
                    {urgency !== 'normal' && <AlertCircle className={`h-4 w-4 ${
                      urgency === 'critical' ? 'text-red-600' : 'text-orange-600'
                    }`} />}
                    <span className="font-medium">{c.chequeNo}</span>
                    <span className="text-[var(--color-muted-foreground)]">{c.client}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>${c.amount.toFixed(2)}</span>
                    <div className="flex flex-col items-end">
                      <span className="text-[var(--color-muted-foreground)]">{new Date(c.dueDate).toLocaleDateString()}</span>
                      {urgency !== 'normal' && (
                        <span className={`text-xs font-medium ${
                          urgency === 'critical' ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          {days === 0 ? 'Due Today' : days === 1 ? 'Due Tomorrow' : `${days} days left`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Cheques</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cheque No</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((i) => {
                const urgency = i.status === "pending" ? getUrgencyLevel(i.dueDate) : null;
                return (
                  <TableRow key={i.id} className={
                    urgency === 'critical' ? 'bg-red-50/50 dark:bg-red-950/10' :
                    urgency === 'warning' ? 'bg-orange-50/50 dark:bg-orange-950/10' :
                    urgency === 'overdue' ? 'bg-destructive/10' : ''
                  }>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {urgency === 'critical' && <AlertCircle className="h-4 w-4 text-red-600" />}
                        {urgency === 'warning' && <AlertCircle className="h-4 w-4 text-orange-600" />}
                        {urgency === 'overdue' && <AlertCircle className="h-4 w-4 text-destructive" />}
                        {i.chequeNo}
                      </div>
                    </TableCell>
                    <TableCell>{i.client}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{new Date(i.dueDate).toLocaleDateString()}</span>
                        {i.status === "pending" && urgency && urgency !== 'normal' && (
                          <span className={`text-xs font-medium ${
                            urgency === 'overdue' ? 'text-destructive' :
                            urgency === 'critical' ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            {urgency === 'overdue' ? 'Overdue!' : 
                             getDaysUntilDue(i.dueDate) === 0 ? 'Due Today' :
                             getDaysUntilDue(i.dueDate) === 1 ? 'Due Tomorrow' :
                             `${getDaysUntilDue(i.dueDate)} days`}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">${i.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`capitalize ${
                        i.status === 'cleared' ? 'text-green-600' :
                        i.status === 'bounced' ? 'text-red-600' :
                        urgency === 'critical' || urgency === 'overdue' ? 'text-red-600 font-semibold' :
                        urgency === 'warning' ? 'text-orange-600 font-medium' :
                        ''
                      }`}>
                        {i.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => onEdit(i)} disabled={!can.update}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(i.id)} disabled={!can.delete}>Delete</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}