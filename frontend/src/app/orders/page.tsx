"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Order {
  id: number;
  clientName: string;
  fishName: string;
  quantityKg: number;
  pricePerKg: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Order>>({ status: "pending" });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        setOrders(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const revenue = useMemo(() => orders.reduce((s, o) => s + o.quantityKg * o.pricePerKg, 0), [orders]);

  const saveOrder = async () => {
    const payload: Order = {
      id: editingId ?? Math.max(0, ...orders.map((o) => o.id)) + 1,
      clientName: String(form.clientName ?? "Client"),
      fishName: String(form.fishName ?? "Fish"),
      quantityKg: Number(form.quantityKg ?? 0),
      pricePerKg: Number(form.pricePerKg ?? 0),
      status: (form.status as Order["status"]) ?? "pending",
      createdAt: form.createdAt || new Date().toISOString(),
    };
    
    if (editingId) {
      setOrders((prev) => prev.map((o) => (o.id === editingId ? payload : o)));
      await fetch("/api/orders", { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload) 
      });
    } else {
      setOrders((prev) => [payload, ...prev]);
      await fetch("/api/orders", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload) 
      });
    }
    
    setOpen(false);
    setEditingId(null);
    setForm({ status: "pending" });
  };

  const onEdit = (order: Order) => {
    setForm(order);
    setEditingId(order.id);
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    setOrders((prev) => prev.filter((o) => o.id !== id));
    await fetch(`/api/orders?id=${id}`, { method: "DELETE" });
  };

  if (loading) return <div>Loading orders…</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); setForm({ status: "pending" }); }}>New Order</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Order" : "Create Order"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="client">Client Name</Label>
                <Input id="client" value={form.clientName ?? ""} onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fish">Fish</Label>
                <Input id="fish" value={form.fishName ?? ""} onChange={(e) => setForm((f) => ({ ...f, fishName: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="qty">Quantity (kg)</Label>
                  <Input id="qty" type="number" value={form.quantityKg ?? ""} onChange={(e) => setForm((f) => ({ ...f, quantityKg: Number(e.target.value) }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ppk">Price / kg ($)</Label>
                  <Input id="ppk" type="number" value={form.pricePerKg ?? ""} onChange={(e) => setForm((f) => ({ ...f, pricePerKg: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={(form.status as string) || "pending"} onValueChange={(v) => setForm((f) => ({ ...f, status: v as any }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={saveOrder}>{editingId ? "Save Changes" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Total Orders</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{orders.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Revenue</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">${revenue.toFixed(2)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Fish</TableHead>
                <TableHead className="text-right">Qty (kg)</TableHead>
                <TableHead className="text-right">Price/kg</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{o.clientName}</TableCell>
                  <TableCell>{o.fishName}</TableCell>
                  <TableCell className="text-right">{o.quantityKg}</TableCell>
                  <TableCell className="text-right">${o.pricePerKg.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${(o.quantityKg * o.pricePerKg).toFixed(2)}</TableCell>
                  <TableCell className="capitalize">{o.status}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(o)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(o.id)}>Delete</Button>
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