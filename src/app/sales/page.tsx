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

interface SaleLineItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface Sale {
  id: number;
  invoiceNo: string;
  customerId: number;
  customerName: string;
  date: string;
  lineItems: SaleLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "paid" | "unpaid" | "partially_paid";
}

interface Customer {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Sale>>({
    customerId: undefined,
    customerName: "",
    date: new Date().toISOString().split("T")[0],
    lineItems: [],
    status: "unpaid",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Search, Sort, Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"invoiceNo" | "customerName" | "date" | "total">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const load = async () => {
      try {
        const [salesRes, customersRes, productsRes] = await Promise.all([
          fetch("/api/sales").then(r => r.json()),
          fetch("/api/customers").then(r => r.json()),
          fetch("/api/products").then(r => r.json()),
        ]);
        setSales(salesRes);
        setCustomers(customersRes.map((c: any) => ({ id: c.id, name: c.name })));
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

  const updateLineItem = (index: number, field: keyof SaleLineItem, value: any) => {
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

  const saveSale = async () => {
    if (!form.customerId) {
      toast.error("Please select a customer");
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
    
    const customer = customers.find(c => c.id === form.customerId);
    
    const payload: Sale = {
      id: editingId ?? Math.max(0, ...sales.map(s => s.id)) + 1,
      invoiceNo: form.invoiceNo || `INV-${String(sales.length + 1).padStart(3, "0")}`,
      customerId: form.customerId!,
      customerName: customer?.name || "",
      date: form.date || new Date().toISOString().split("T")[0],
      lineItems: form.lineItems,
      subtotal: form.subtotal || 0,
      tax: form.tax || 0,
      total: form.total || 0,
      status: form.status || "unpaid",
    };
    
    try {
      if (editingId) {
        setSales(prev => prev.map(s => s.id === editingId ? payload : s));
        await fetch("/api/sales", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        toast.success("Sale updated successfully");
      } else {
        setSales(prev => [payload, ...prev]);
        await fetch("/api/sales", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        toast.success("Sale created successfully");
      }
      
      setOpen(false);
      setEditingId(null);
      resetForm();
    } catch (e) {
      toast.error("Failed to save sale");
    }
  };

  const resetForm = () => {
    setForm({
      customerId: undefined,
      customerName: "",
      date: new Date().toISOString().split("T")[0],
      lineItems: [],
      status: "unpaid",
    });
  };

  const onEdit = (sale: Sale) => {
    setForm(sale);
    setEditingId(sale.id);
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this sale?")) return;
    try {
      setSales(prev => prev.filter(s => s.id !== id));
      await fetch(`/api/sales?id=${id}`, { method: "DELETE" });
      toast.success("Sale deleted successfully");
    } catch (e) {
      toast.error("Failed to delete sale");
    }
  };

  const updateStatus = async (id: number, status: Sale["status"]) => {
    try {
      setSales(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      await fetch("/api/sales", {
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
  const filteredAndSortedSales = useMemo(() => {
    let filtered = sales.filter(s =>
      s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [sales, searchTerm, sortField, sortDirection]);

  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedSales.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedSales, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedSales.length / itemsPerPage);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const totalRevenue = useMemo(() => sales.reduce((sum, s) => sum + s.total, 0), [sales]);
  const paidRevenue = useMemo(() => sales.filter(s => s.status === "paid").reduce((sum, s) => sum + s.total, 0), [sales]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-lg text-[var(--color-muted-foreground)]">Loading sales…</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Sales</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Manage sales invoices and transactions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); resetForm(); }}>New Sale</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Sale" : "Create Sale"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Customer <span className="text-red-500">*</span></Label>
                  <Select
                    value={form.customerId?.toString()}
                    onValueChange={(val) => {
                      const customer = customers.find(c => c.id === parseInt(val));
                      setForm(f => ({ ...f, customerId: parseInt(val), customerName: customer?.name || "" }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
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
                  <Button type="button" size="sm" variant="outline" onClick={addLineItem}>
                    <Plus className="h-4 w-4 mr-1" /> Add Product
                  </Button>
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
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removeLineItem(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
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
                  onValueChange={(val) => setForm(f => ({ ...f, status: val as Sale["status"] }))}
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
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={saveSale}>{editingId ? "Save Changes" : "Create Sale"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Total Sales</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{sales.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-[var(--chart-2)]">${totalRevenue.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Paid Revenue</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">${paidRevenue.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Outstanding</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-[var(--chart-1)]">${(totalRevenue - paidRevenue).toFixed(2)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>Sales Invoices</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
              <Input
                placeholder="Search invoices..."
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
                    <Button variant="ghost" size="sm" onClick={() => handleSort("invoiceNo")} className="h-8 px-2">
                      Invoice # <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("customerName")} className="h-8 px-2">
                      Customer <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("date")} className="h-8 px-2">
                      Date <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("total")} className="h-8 px-2">
                      Amount <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSales.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-[var(--color-muted-foreground)]">
                      {searchTerm ? "No sales found" : "No sales yet"}
                    </TableCell>
                  </TableRow>
                )}
                {paginatedSales.map(sale => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.invoiceNo}</TableCell>
                    <TableCell>{sale.customerName}</TableCell>
                    <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-semibold">${sale.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select value={sale.status} onValueChange={(val) => updateStatus(sale.id, val as Sale["status"])}>
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
                      <Button size="sm" variant="outline" onClick={() => onEdit(sale)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(sale.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedSales.length)} of {filteredAndSortedSales.length} sales
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}