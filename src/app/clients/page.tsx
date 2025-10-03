"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Client { id: number; name: string; email: string; phone: string; address?: string }

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Client>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/clients");
        const data = await res.json();
        setClients(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load clients");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveClient = async () => {
    const payload: Client = {
      id: editingId ?? Math.max(0, ...clients.map(c => c.id)) + 1,
      name: String(form.name ?? "New Client"),
      email: String(form.email ?? ""),
      phone: String(form.phone ?? ""),
      address: String(form.address ?? ""),
    };
    
    if (editingId) {
      setClients(prev => prev.map(c => c.id === editingId ? payload : c));
      await fetch("/api/clients", { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload) 
      });
    } else {
      setClients(prev => [payload, ...prev]);
      await fetch("/api/clients", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload) 
      });
    }
    
    setOpen(false);
    setEditingId(null);
    setForm({});
  };

  const onEdit = (client: Client) => {
    setForm(client);
    setEditingId(client.id);
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    setClients(prev => prev.filter(c => c.id !== id));
    await fetch(`/api/clients?id=${id}`, { method: "DELETE" });
  };

  if (loading) return <div>Loading clients…</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); setForm({}); }}>New Client</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Client" : "Add Client"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name ?? ""} onChange={(e) => setForm(f => ({...f, name: e.target.value}))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email ?? ""} onChange={(e) => setForm(f => ({...f, email: e.target.value}))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone ?? ""} onChange={(e) => setForm(f => ({...f, phone: e.target.value}))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={form.address ?? ""} onChange={(e) => setForm(f => ({...f, address: e.target.value}))} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={saveClient}>{editingId ? "Save Changes" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.address}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(c)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(c.id)}>Delete</Button>
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