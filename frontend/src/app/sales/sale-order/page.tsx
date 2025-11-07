"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, ShoppingCart, Download } from "lucide-react";
import { toast } from "sonner";

interface SaleOrder {
  id: number;
  orderNo: string;
  customerName: string;
  date: string;
  deliveryDate: string;
  items: string;
  totalAmount: number;
  status: "Pending" | "Confirmed" | "Processing" | "Ready" | "Completed" | "Cancelled";
}

type SortField = "orderNo" | "customerName" | "date" | "totalAmount" | "status";
type SortDirection = "asc" | "desc";

export default function SaleOrderPage() {
  const [orders, setOrders] = useState<SaleOrder[]>([
    { id: 1, orderNo: "SO-2025-001", customerName: "Ocean Fresh Seafood", date: "2025-01-10", deliveryDate: "2025-01-15", items: "Fresh Salmon (50kg), Tuna (30kg)", totalAmount: 2500, status: "Confirmed" },
    { id: 2, orderNo: "SO-2025-002", customerName: "Marine Delights Ltd", date: "2025-01-12", deliveryDate: "2025-01-17", items: "Shrimp (100kg), Crab (20kg)", totalAmount: 3200, status: "Processing" },
    { id: 3, orderNo: "SO-2025-003", customerName: "Coastal Distributors", date: "2025-01-14", deliveryDate: "2025-01-19", items: "Cod (40kg), Mackerel (60kg)", totalAmount: 1800, status: "Ready" },
    { id: 4, orderNo: "SO-2025-004", customerName: "Bay Area Wholesalers", date: "2025-01-16", deliveryDate: "2025-01-21", items: "Lobster (15kg), Oysters (25kg)", totalAmount: 4500, status: "Confirmed" },
    { id: 5, orderNo: "SO-2025-005", customerName: "Harbor Foods Inc", date: "2025-01-05", deliveryDate: "2025-01-10", items: "Halibut (35kg)", totalAmount: 1200, status: "Completed" },
  ]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<SaleOrder>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("orderNo");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const itemsPerPage = 10;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.orderNo?.trim()) errors.orderNo = "Order number is required";
    if (!form.customerName?.trim()) errors.customerName = "Customer name is required";
    if (!form.date) errors.date = "Date is required";
    if (!form.deliveryDate) errors.deliveryDate = "Delivery date is required";
    if (!form.items?.trim()) errors.items = "Items are required";
    if (!form.totalAmount || form.totalAmount <= 0) errors.totalAmount = "Total amount must be greater than 0";
    if (!form.status) errors.status = "Status is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveOrder = () => {
    if (!validateForm()) {
      toast.error("Please fix form errors");
      return;
    }

    const payload: SaleOrder = {
      id: editingId ?? Math.max(0, ...orders.map(o => o.id)) + 1,
      orderNo: String(form.orderNo ?? ""),
      customerName: String(form.customerName ?? ""),
      date: String(form.date ?? ""),
      deliveryDate: String(form.deliveryDate ?? ""),
      items: String(form.items ?? ""),
      totalAmount: Number(form.totalAmount ?? 0),
      status: (form.status ?? "Pending") as SaleOrder["status"],
    };

    if (editingId) {
      setOrders(prev => prev.map(o => o.id === editingId ? payload : o));
      toast.success("Sale order updated successfully");
    } else {
      setOrders(prev => [payload, ...prev]);
      toast.success("Sale order created successfully");
    }

    setOpen(false);
    setEditingId(null);
    setForm({});
    setFormErrors({});
  };

  const onEdit = (order: SaleOrder) => {
    setForm(order);
    setEditingId(order.id);
    setFormErrors({});
    setOpen(true);
  };

  const onDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this sale order?")) return;
    setOrders(prev => prev.filter(o => o.id !== id));
    toast.success("Sale order deleted successfully");
  };

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter(o =>
      (statusFilter === "all" || o.status === statusFilter) &&
      (o.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
       o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       o.items.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [orders, searchTerm, sortField, sortDirection, statusFilter]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedOrders, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: "bg-gray-100 text-gray-700",
      Confirmed: "bg-blue-100 text-blue-700",
      Processing: "bg-yellow-100 text-yellow-700",
      Ready: "bg-purple-100 text-purple-700",
      Completed: "bg-green-100 text-green-700",
      Cancelled: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Sale Orders</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Manage confirmed sales orders</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => { setEditingId(null); setForm({}); setFormErrors({}); }}
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-blue-200 transition"
            >
              New Sale Order
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Sale Order" : "Add Sale Order"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label htmlFor="orderNo">Order No <span className="text-red-500">*</span></Label>
                <Input
                  id="orderNo"
                  value={form.orderNo ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, orderNo: e.target.value }))}
                  className={formErrors.orderNo ? "border-red-500" : ""}
                />
                {formErrors.orderNo && <p className="text-xs text-red-500">{formErrors.orderNo}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customerName">Customer Name <span className="text-red-500">*</span></Label>
                <Input
                  id="customerName"
                  value={form.customerName ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, customerName: e.target.value }))}
                  className={formErrors.customerName ? "border-red-500" : ""}
                />
                {formErrors.customerName && <p className="text-xs text-red-500">{formErrors.customerName}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Order Date <span className="text-red-500">*</span></Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                  className={formErrors.date ? "border-red-500" : ""}
                />
                {formErrors.date && <p className="text-xs text-red-500">{formErrors.date}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deliveryDate">Delivery Date <span className="text-red-500">*</span></Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={form.deliveryDate ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, deliveryDate: e.target.value }))}
                  className={formErrors.deliveryDate ? "border-red-500" : ""}
                />
                {formErrors.deliveryDate && <p className="text-xs text-red-500">{formErrors.deliveryDate}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="items">Items <span className="text-red-500">*</span></Label>
                <Input
                  id="items"
                  value={form.items ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, items: e.target.value }))}
                  className={formErrors.items ? "border-red-500" : ""}
                />
                {formErrors.items && <p className="text-xs text-red-500">{formErrors.items}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="totalAmount">Total Amount <span className="text-red-500">*</span></Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  value={form.totalAmount ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, totalAmount: parseFloat(e.target.value) || 0 }))}
                  className={formErrors.totalAmount ? "border-red-500" : ""}
                />
                {formErrors.totalAmount && <p className="text-xs text-red-500">{formErrors.totalAmount}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                <select
                  id="status"
                  value={form.status ?? "Pending"}
                  onChange={(e) => setForm(f => ({ ...f, status: e.target.value as SaleOrder["status"] }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Ready">Ready</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                {formErrors.status && <p className="text-xs text-red-500">{formErrors.status}</p>}
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
                onClick={saveOrder}
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
          <CardHeader><CardTitle>Total Orders</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{orders.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Confirmed</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-blue-600">
            {orders.filter(o => o.status === "Confirmed").length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Completed</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === "Completed").length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Value</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">
            ${orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>Sale Order List</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Ready">Ready</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8"
                />
              </div>
              <button className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-gray-200 transition">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button onClick={() => handleSort("orderNo")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Order No <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("customerName")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Customer <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("date")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Order Date <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("totalAmount")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Amount <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("status")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Status <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-[var(--color-muted-foreground)]">
                      {searchTerm || statusFilter !== "all" ? "No orders found" : "No orders yet"}
                    </TableCell>
                  </TableRow>
                )}
                {paginatedOrders.map(o => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.orderNo}</TableCell>
                    <TableCell>{o.customerName}</TableCell>
                    <TableCell>{o.date}</TableCell>
                    <TableCell>{o.deliveryDate}</TableCell>
                    <TableCell>${o.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <button onClick={() => onEdit(o)} className="inline-block bg-green-100 text-green-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-green-200 transition">
                        Edit
                      </button>
                      <button onClick={() => onDelete(o.id)} className="inline-block bg-red-100 text-red-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-red-200 transition">
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedOrders.length)} of {filteredAndSortedOrders.length} orders
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded border border-input bg-background hover:bg-accent hover:text-accent-foreground transition disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded border border-input bg-background hover:bg-accent hover:text-accent-foreground transition disabled:opacity-50 disabled:cursor-not-allowed">
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