"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FishItem {
  id: number;
  name: string;
  type: string;
  pricePerKg: number;
  stockKg: number;
  availability: "in_stock" | "low_stock" | "out_of_stock";
}

export default function InventoryPage() {
  const [items, setItems] = useState<FishItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<FishItem>>({ type: "fresh" as any, availability: "in_stock" });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/inventory");
        const data = await res.json();
        setItems(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load inventory");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveItem = async () => {
    const payload: FishItem = {
      id: editingId ?? Math.max(0, ...items.map((i) => i.id)) + 1,
      name: String(form.name ?? "Unnamed"),
      type: String(form.type ?? "fresh"),
      pricePerKg: Number(form.pricePerKg ?? 0),
      stockKg: Number(form.stockKg ?? 0),
      availability: (form.availability as FishItem["availability"]) ?? "in_stock",
    };
    if (editingId) {
      setItems((prev) => prev.map((i) => (i.id === editingId ? payload : i)));
    } else {
      setItems((prev) => [payload, ...prev]);
    }
    await fetch("/api/inventory", { method: "POST", body: JSON.stringify(payload) });
    setOpen(false);
    setEditingId(null);
    setForm({ type: "fresh" as any, availability: "in_stock" });
  };

  const onEdit = (item: FishItem) => {
    setForm(item);
    setEditingId(item.id);
    setOpen(true);
  };

  const onDelete = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const totalSkus = items.length;
  const totalStock = useMemo(() => items.reduce((s, i) => s + i.stockKg, 0), [items]);

  if (loading) return <div>Loading inventory…</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button 
              onClick={() => { setEditingId(null); setForm({ type: "fresh" as any, availability: "in_stock" }); }}
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-blue-200 transition"
            >
              Add Fish
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Fish" : "Add Fish"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name ?? ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={(form.type as string) || "fresh"} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fresh">Fresh</SelectItem>
                    <SelectItem value="frozen">Frozen</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price / kg ($)</Label>
                  <Input id="price" type="number" value={form.pricePerKg ?? ""} onChange={(e) => setForm((f) => ({ ...f, pricePerKg: Number(e.target.value) }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock (kg)</Label>
                  <Input id="stock" type="number" value={form.stockKg ?? ""} onChange={(e) => setForm((f) => ({ ...f, stockKg: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Availability</Label>
                <Select value={(form.availability as string) || "in_stock"} onValueChange={(v) => setForm((f) => ({ ...f, availability: v as any }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <button 
                onClick={saveItem}
                className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-indigo-200 transition"
              >
                {editingId ? "Save changes" : "Create"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>SKUs</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{totalSkus}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Stock (kg)</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{totalStock.toLocaleString()}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fish Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Price/kg</TableHead>
                <TableHead className="text-right">Stock (kg)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="capitalize">{item.type}</TableCell>
                  <TableCell className="text-right">${item.pricePerKg.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.stockKg}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                        item.availability === "in_stock"
                          ? "bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300"
                          : item.availability === "low_stock"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-300"
                          : "bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300"
                      }`}
                    >
                      {item.availability.replaceAll("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <button 
                      onClick={() => onEdit(item)}
                      className="inline-block bg-green-100 text-green-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-green-200 transition"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="inline-block bg-red-100 text-red-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
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