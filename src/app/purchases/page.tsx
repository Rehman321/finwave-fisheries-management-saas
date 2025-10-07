"use client";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PurchaseLineItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface Purchase {
  id: number;
  invoiceNo: string;
  supplierId: number;
  supplierName: string;
  date: string;
  lineItems: PurchaseLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "paid" | "unpaid" | "partially_paid";
}

interface Supplier {
  id: number;
  companyName: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Purchase>>({
    supplierId: undefined,
    supplierName: "",
    date: new Date().toISOString().split("T")[0],
    lineItems: [],
    status: "unpaid",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Search, Sort, Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"invoiceNo" | "supplierName" | "date" | "total">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const load = async () => {
      try {
        const [purchasesRes, suppliersRes, productsRes] = await Promise.all([
          fetch("/api/purchases").then(r => r.json()),
          fetch("/api/suppliers").then(r => r.json()),
          fetch("/api/products").then(r => r.json()),
        ]);
        
        // Transform existing purchases API data to match new structure
        const transformedPurchases = purchasesRes.map((p: any) => ({
          id: p.id,
          invoiceNo: p.invoiceNo,
          supplierId: p.supplierId || 1,
          supplierName: p.supplier || p.supplierName || "Unknown Supplier",
          date: p.date,
          lineItems: p.lineItems || [{ productId: 1, productName: "Mixed Products", quantity: 1, price: p.amount, total: p.amount }],
          subtotal: p.subtotal || p.amount * 0.9,
          tax: p.tax || p.amount * 0.1,
          total: p.amount || p.total,
          status: p.status,
        }));
        
        setPurchases(transformedPurchases);
        setSuppliers(suppliersRes.map((s: any) => ({ id: s.id, companyName: s.companyName })));
        setProducts(productsRes.map((p: any) => ({ id: p.id, name: p.name, price: p.price || 0 })));
      } catch (e: any) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const addLineItem = () => {
    setForm(f => ({
      ...f,
      lineItems: [
        ...(f.lineItems || []),
        { productId: 0, productName: "", quantity: 1, price: 0, total: 0 }
      ]
    }));
  };

  const removeLineItem = (index: number) => {
    setForm(f => ({
      ...f,
      lineItems: (f.lineItems || []).filter((_, i) => i !== index)
    }));
  };

  const updateLineItem = (index: number, field: keyof PurchaseLineItem, value: any) => {
    setForm(f => {
      const items = [...(f.lineItems || [])];
      items[index] = { ...items[index], [field]: value };
      
      if (field === "productId") {
        const product = products.find(p => p.id === value);
        if (product) {
          items[index].productName = product.name;
          items[index].price = product.price;
        }
      }
      
      if (field === "quantity" || field === "price" || field === "productId") {
        items[index].total = items[index].quantity * items[index].price;
      }
      
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + tax;
      
      return { ...f, lineItems: items, subtotal, tax, total };
    });
  };

  const savePurchase = async () => {
    if (!form.supplierId) {
      toast.error("Please select a supplier");
      return;
    }
    
    if (!form.lineItems || form.lineItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }
    
    const invalidItem = form.lineItems.find(item => !item.productId || item.quantity <= 0);
    if (invalidItem) {
      toast.error("Please fill in all product details");
      return;
    }
    
    const supplier = suppliers.find(s => s.id === form.supplierId);
    
    const payload: Purchase = {
      id: editingId ?? Math.max(0, ...purchases.map(p => p.id)) + 1,
      invoiceNo: form.invoiceNo || `PO-${String(purchases.length + 1).padStart(3, "0")}`,
      supplierId: form.supplierId!,
      supplierName: supplier?.companyName || "",
      date: form.date || new Date().toISOString().split("T")[0],
      lineItems: form.lineItems,
      subtotal: form.subtotal || 0,
      tax: form.tax || 0,
      total: form.total || 0,
      status: form.status || "unpaid",
    };
    
    try {
      if (editingId) {
        setPurchases(prev => prev.map(p => p.id === editingId ? payload : p));
        await fetch("/api/purchases", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: payload.id,
            supplier: payload.supplierName,
            date: payload.date,
            invoiceNo: payload.invoiceNo,
            amount: payload.total,
            status: payload.status,
          })
        });
        toast.success("Purchase updated successfully");
      } else {
        setPurchases(prev => [payload, ...prev]);
        await fetch("/api/purchases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            supplier: payload.supplierName,
            date: payload.date,
            invoiceNo: payload.invoiceNo,
            amount: payload.total,
            status: payload.status,
          })
        });
        toast.success("Purchase created successfully");
      }
      
      setOpen(false);
      setEditingId(null);
      resetForm();
    } catch (e) {
      toast.error("Failed to save purchase");
    }
  };

  const resetForm = () => {
    setForm({
      supplierId: undefined,
      supplierName: "",
      date: new Date().toISOString().split("T")[0],
      lineItems: [],
      status: "unpaid",
    });
  };

  const onEdit = (purchase: Purchase) => {
    setForm(purchase);
    setEditingId(purchase.id);
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this purchase?")) return;
    try {
      setPurchases(prev => prev.filter(p => p.id !== id));
      await fetch(`/api/purchases?id=${id}`, { method: "DELETE" });
      toast.success("Purchase deleted successfully");
    } catch (e) {
      toast.error("Failed to delete purchase");
    }
  };

  const updateStatus = async (id: number, status: Purchase["status"]) => {
    try {
      setPurchases(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      await fetch("/api/purchases", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      toast.success("Status updated");
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  // Filtered and sorted data
  const filteredAndSortedPurchases = useMemo(() => {
    let filtered = purchases.filter(p =>
      p.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      
      if (sortField === "date") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [purchases, searchTerm, sortField, sortDirection]);

  const paginatedPurchases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedPurchases.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedPurchases, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedPurchases.length / itemsPerPage);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const totalAmount = useMemo(() => purchases.reduce((sum, p) => sum + p.total, 0), [purchases]);
  const paidAmount = useMemo(() => purchases.filter(p => p.status === "paid").reduce((sum, p) => sum + p.total, 0), [purchases]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-lg text-[var(--color-muted-foreground)]">Loading purchases…</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Purchases</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Manage purchase orders and supplier transactions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button 
              onClick={() => { setEditingId(null); resetForm(); }}
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-blue-200 transition"
            >
              New Purchase
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Purchase" : "Create Purchase"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Supplier <span className="text-red-500">*</span></Label>
                  <Select
                    value={form.supplierId?.toString()}
                    onValueChange={(val) => {
                      const supplier = suppliers.find(s => s.id === parseInt(val));
                      setForm(f => ({ ...f, supplierId: parseInt(val), supplierName: supplier?.companyName || "" }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(s => (
                        <SelectItem key={s.id} value={s.id.toString()}>{s.companyName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Date <span className="text-red-500">*</span></Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Line Items <span className="text-red-500">*</span></Label>
                  <button 
                    type="button"
                    onClick={addLineItem}
                    className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1.5 text-sm font-medium rounded-full hover:bg-gray-200 transition"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Product
                  </button>
                </div>
                
                {form.lineItems && form.lineItems.length > 0 && (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="w-24">Qty</TableHead>
                          <TableHead className="w-32">Price</TableHead>
                          <TableHead className="w-32">Total</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {form.lineItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Select
                                value={item.productId?.toString()}
                                onValueChange={(val) => updateLineItem(index, "productId", parseInt(val))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map(p => (
                                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateLineItem(index, "quantity", parseInt(e.target.value) || 1)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.price}
                                onChange={(e) => updateLineItem(index, "price", parseFloat(e.target.value) || 0)}
                              />
                            </TableCell>
                            <TableCell className="font-semibold">
                              ${item.total.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <button
                                type="button"
                                onClick={() => removeLineItem(index)}
                                className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-red-50 transition"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-2 border rounded-lg p-4 bg-[var(--color-muted)]">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${(form.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (10%):</span>
                    <span>${(form.tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${(form.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(val) => setForm(f => ({ ...f, status: val as Purchase["status"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  </SelectContent>
                </Select>
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
                onClick={savePurchase}
                className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-indigo-200 transition"
              >
                {editingId ? "Save Changes" : "Create Purchase"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Total Purchases</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{purchases.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Amount</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-[var(--chart-1)]">${totalAmount.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Paid Amount</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">${paidAmount.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Outstanding</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">${(totalAmount - paidAmount).toFixed(2)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>Purchase Orders</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
              <Input
                placeholder="Search purchases..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8"
              />
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
                      onClick={() => handleSort("supplierName")}
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Supplier <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      onClick={() => handleSort("date")}
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Date <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      onClick={() => handleSort("invoiceNo")}
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Invoice # <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      onClick={() => handleSort("total")}
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Amount <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPurchases.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-[var(--color-muted-foreground)]">
                      {searchTerm ? "No purchases found" : "No purchases yet"}
                    </TableCell>
                  </TableRow>
                )}
                {paginatedPurchases.map(purchase => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.supplierName}</TableCell>
                    <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                    <TableCell>{purchase.invoiceNo}</TableCell>
                    <TableCell className="font-semibold">${purchase.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select value={purchase.status} onValueChange={(val) => updateStatus(purchase.id, val as Purchase["status"])}>
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                              Paid
                            </span>
                          </SelectItem>
                          <SelectItem value="unpaid">
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800">
                              Unpaid
                            </span>
                          </SelectItem>
                          <SelectItem value="partially_paid">
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                              Partially Paid
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <button 
                        onClick={() => onEdit(purchase)}
                        className="inline-block bg-green-100 text-green-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-green-200 transition"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => onDelete(purchase.id)}
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedPurchases.length)} of {filteredAndSortedPurchases.length} purchases
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