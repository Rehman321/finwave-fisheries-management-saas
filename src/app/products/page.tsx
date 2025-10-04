"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Product { id: number; name: string; category: string; price: number; unit: string; stock: number }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Product>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveProduct = async () => {
    const payload: Product = {
      id: editingId ?? Math.max(0, ...products.map(p => p.id)) + 1,
      name: String(form.name ?? "New Product"),
      category: String(form.category ?? "General"),
      price: Number(form.price ?? 0),
      unit: String(form.unit ?? "kg"),
      stock: Number(form.stock ?? 0),
    };
    
    if (editingId) {
      setProducts(prev => prev.map(p => p.id === editingId ? payload : p));
      await fetch("/api/products", { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload) 
      });
    } else {
      setProducts(prev => [payload, ...prev]);
      await fetch("/api/products", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload) 
      });
    }
    
    setOpen(false);
    setEditingId(null);
    setForm({});
  };

  const onEdit = (product: Product) => {
    setForm(product);
    setEditingId(product.id);
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setProducts(prev => prev.filter(p => p.id !== id));
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
  };

  if (loading) return <div>Loading products…</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Products/Items</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Manage your product catalog and inventory items</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button 
              onClick={() => { setEditingId(null); setForm({}); }}
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-blue-200 transition"
            >
              New Product
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name ?? ""} onChange={(e) => setForm(f => ({...f, name: e.target.value}))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={form.category ?? ""} onChange={(e) => setForm(f => ({...f, category: e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" type="number" value={form.price ?? ""} onChange={(e) => setForm(f => ({...f, price: Number(e.target.value)}))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input id="unit" value={form.unit ?? ""} onChange={(e) => setForm(f => ({...f, unit: e.target.value}))} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" value={form.stock ?? ""} onChange={(e) => setForm(f => ({...f, stock: Number(e.target.value)}))} />
              </div>
            </div>
            <DialogFooter>
              <button 
                onClick={() => setOpen(false)}
                className="inline-block bg-gray-100 text-gray-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={saveProduct}
                className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-indigo-200 transition"
              >
                {editingId ? "Save Changes" : "Create"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Total Products</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{products.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Stock</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{products.reduce((s, p) => s + p.stock, 0)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell className="text-right">${p.price.toFixed(2)}</TableCell>
                  <TableCell>{p.unit}</TableCell>
                  <TableCell className="text-right">{p.stock}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <button 
                      onClick={() => onEdit(p)}
                      className="inline-block bg-green-100 text-green-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-green-200 transition"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => onDelete(p.id)}
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