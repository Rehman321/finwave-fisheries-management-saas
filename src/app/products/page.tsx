"use client";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Product { 
  id: number; 
  name: string; 
  category: string; 
  price: number; 
  unit: string; 
  stock: number;
}

type SortField = "name" | "category" | "price" | "stock";
type SortDirection = "asc" | "desc";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Product>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Search, Sort, Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (e: any) {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!form.name?.trim()) {
      errors.name = "Product name is required";
    }
    
    if (!form.category?.trim()) {
      errors.category = "Category is required";
    }
    
    if (form.price === undefined || isNaN(Number(form.price)) || Number(form.price) < 0) {
      errors.price = "Valid price is required";
    }
    
    if (!form.unit?.trim()) {
      errors.unit = "Unit is required";
    }
    
    if (form.stock === undefined || isNaN(Number(form.stock)) || Number(form.stock) < 0) {
      errors.stock = "Valid stock quantity is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveProduct = async () => {
    if (!validateForm()) {
      toast.error("Please fix form errors");
      return;
    }

    const payload: Product = {
      id: editingId ?? Math.max(0, ...products.map(p => p.id)) + 1,
      name: String(form.name ?? "").trim(),
      category: String(form.category ?? "").trim(),
      price: Number(form.price ?? 0),
      unit: String(form.unit ?? "").trim(),
      stock: Number(form.stock ?? 0),
    };
    
    try {
      if (editingId) {
        setProducts(prev => prev.map(p => p.id === editingId ? payload : p));
        await fetch("/api/products", { 
          method: "PATCH", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload) 
        });
        toast.success("Product updated successfully");
      } else {
        setProducts(prev => [payload, ...prev]);
        await fetch("/api/products", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload) 
        });
        toast.success("Product created successfully");
      }
      
      setOpen(false);
      setEditingId(null);
      setForm({});
      setFormErrors({});
    } catch (e) {
      toast.error("Failed to save product");
    }
  };

  const onEdit = (product: Product) => {
    setForm(product);
    setEditingId(product.id);
    setFormErrors({});
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      setProducts(prev => prev.filter(p => p.id !== id));
      await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      toast.success("Product deleted successfully");
    } catch (e) {
      toast.error("Failed to delete product");
    }
  };

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return uniqueCategories.sort();
  }, [products]);

  // Filtered and sorted data
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchesSearch = !searchTerm || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, searchTerm, categoryFilter, sortField, sortDirection]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const totalStock = useMemo(() => products.reduce((s, p) => s + p.stock, 0), [products]);
  const lowStockCount = useMemo(() => products.filter(p => p.stock < 10).length, [products]);
  const totalValue = useMemo(() => products.reduce((s, p) => s + (p.stock * p.price), 0), [products]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-lg text-[var(--color-muted-foreground)]">Loading products…</div>
    </div>
  );

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
              onClick={() => { setEditingId(null); setForm({}); setFormErrors({}); }}
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
                <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  value={form.name ?? ""} 
                  onChange={(e) => setForm(f => ({...f, name: e.target.value}))}
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                <Input 
                  id="category" 
                  value={form.category ?? ""} 
                  onChange={(e) => setForm(f => ({...f, category: e.target.value}))}
                  className={formErrors.category ? "border-red-500" : ""}
                />
                {formErrors.category && <p className="text-xs text-red-500">{formErrors.category}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
                  <Input 
                    id="price" 
                    type="number" 
                    step="0.01"
                    value={form.price ?? ""} 
                    onChange={(e) => setForm(f => ({...f, price: Number(e.target.value)}))}
                    className={formErrors.price ? "border-red-500" : ""}
                  />
                  {formErrors.price && <p className="text-xs text-red-500">{formErrors.price}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unit <span className="text-red-500">*</span></Label>
                  <Input 
                    id="unit" 
                    placeholder="kg, pcs, box" 
                    value={form.unit ?? ""} 
                    onChange={(e) => setForm(f => ({...f, unit: e.target.value}))}
                    className={formErrors.unit ? "border-red-500" : ""}
                  />
                  {formErrors.unit && <p className="text-xs text-red-500">{formErrors.unit}</p>}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock <span className="text-red-500">*</span></Label>
                <Input 
                  id="stock" 
                  type="number" 
                  value={form.stock ?? ""} 
                  onChange={(e) => setForm(f => ({...f, stock: Number(e.target.value)}))}
                  className={formErrors.stock ? "border-red-500" : ""}
                />
                {formErrors.stock && <p className="text-xs text-red-500">{formErrors.stock}</p>}
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
          <CardContent className="text-2xl font-bold">{totalStock}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Value</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-[var(--chart-2)]">${totalValue.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Low Stock</CardTitle>
            {lowStockCount > 0 && <AlertTriangle className="h-4 w-4 text-[var(--color-destructive)]" />}
          </CardHeader>
          <CardContent className="text-2xl font-bold text-[var(--color-destructive)]">{lowStockCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>Product Catalog</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-md border border-[var(--color-border)] bg-background px-3 py-2 text-sm w-full sm:w-40"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button 
                      onClick={() => handleSort("name")}
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Name <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      onClick={() => handleSort("category")}
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Category <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      onClick={() => handleSort("price")}
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Price <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>
                    <button 
                      onClick={() => handleSort("stock")}
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Stock <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-[var(--color-muted-foreground)]">
                      {searchTerm || categoryFilter !== "all" ? "No products found" : "No products yet"}
                    </TableCell>
                  </TableRow>
                )}
                {paginatedProducts.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-[var(--color-muted)]">
                        {p.category}
                      </span>
                    </TableCell>
                    <TableCell>${p.price.toFixed(2)}</TableCell>
                    <TableCell>{p.unit}</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${p.stock < 10 ? "text-[var(--color-destructive)]" : ""}`}>
                        {p.stock}
                        {p.stock < 10 && <AlertTriangle className="inline ml-1 h-3 w-3" />}
                      </span>
                    </TableCell>
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
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length} products
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded border border-input bg-background hover:bg-accent hover:text-accent-foreground transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded border border-input bg-background hover:bg-accent hover:text-accent-foreground transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}