"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Truck, Download } from "lucide-react";
import { toast } from "sonner";

interface DeliveryNote {
  id: number;
  deliveryNo: string;
  orderNo: string;
  customerName: string;
  deliveryDate: string;
  items: string;
  deliveredBy: string;
  status: "Pending" | "In Transit" | "Delivered" | "Failed";
}

type SortField = "deliveryNo" | "orderNo" | "customerName" | "deliveryDate" | "status";
type SortDirection = "asc" | "desc";

export default function DeliveryNotePage() {
  const [deliveries, setDeliveries] = useState<DeliveryNote[]>([
    { id: 1, deliveryNo: "DN-2025-001", orderNo: "SO-2025-001", customerName: "Ocean Fresh Seafood", deliveryDate: "2025-01-15", items: "Fresh Salmon (50kg), Tuna (30kg)", deliveredBy: "John Driver", status: "Delivered" },
    { id: 2, deliveryNo: "DN-2025-002", orderNo: "SO-2025-002", customerName: "Marine Delights Ltd", deliveryDate: "2025-01-17", items: "Shrimp (100kg), Crab (20kg)", deliveredBy: "Mike Transport", status: "In Transit" },
    { id: 3, deliveryNo: "DN-2025-003", orderNo: "SO-2025-003", customerName: "Coastal Distributors", deliveryDate: "2025-01-19", items: "Cod (40kg), Mackerel (60kg)", deliveredBy: "Sarah Logistics", status: "Pending" },
    { id: 4, deliveryNo: "DN-2025-004", orderNo: "SO-2025-004", customerName: "Bay Area Wholesalers", deliveryDate: "2025-01-21", items: "Lobster (15kg), Oysters (25kg)", deliveredBy: "Tom Delivery", status: "Delivered" },
    { id: 5, deliveryNo: "DN-2025-005", orderNo: "SO-2025-005", customerName: "Harbor Foods Inc", deliveryDate: "2025-01-10", items: "Halibut (35kg)", deliveredBy: "John Driver", status: "Delivered" },
  ]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<DeliveryNote>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("deliveryNo");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const itemsPerPage = 10;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.deliveryNo?.trim()) errors.deliveryNo = "Delivery number is required";
    if (!form.orderNo?.trim()) errors.orderNo = "Order number is required";
    if (!form.customerName?.trim()) errors.customerName = "Customer name is required";
    if (!form.deliveryDate) errors.deliveryDate = "Delivery date is required";
    if (!form.items?.trim()) errors.items = "Items are required";
    if (!form.deliveredBy?.trim()) errors.deliveredBy = "Delivered by is required";
    if (!form.status) errors.status = "Status is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveDelivery = () => {
    if (!validateForm()) {
      toast.error("Please fix form errors");
      return;
    }

    const payload: DeliveryNote = {
      id: editingId ?? Math.max(0, ...deliveries.map(d => d.id)) + 1,
      deliveryNo: String(form.deliveryNo ?? ""),
      orderNo: String(form.orderNo ?? ""),
      customerName: String(form.customerName ?? ""),
      deliveryDate: String(form.deliveryDate ?? ""),
      items: String(form.items ?? ""),
      deliveredBy: String(form.deliveredBy ?? ""),
      status: (form.status ?? "Pending") as DeliveryNote["status"],
    };

    if (editingId) {
      setDeliveries(prev => prev.map(d => d.id === editingId ? payload : d));
      toast.success("Delivery note updated successfully");
    } else {
      setDeliveries(prev => [payload, ...prev]);
      toast.success("Delivery note created successfully");
    }

    setOpen(false);
    setEditingId(null);
    setForm({});
    setFormErrors({});
  };

  const onEdit = (delivery: DeliveryNote) => {
    setForm(delivery);
    setEditingId(delivery.id);
    setFormErrors({});
    setOpen(true);
  };

  const onDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this delivery note?")) return;
    setDeliveries(prev => prev.filter(d => d.id !== id));
    toast.success("Delivery note deleted successfully");
  };

  const filteredAndSortedDeliveries = useMemo(() => {
    let filtered = deliveries.filter(d =>
      (statusFilter === "all" || d.status === statusFilter) &&
      (d.deliveryNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
       d.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
       d.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
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
  }, [deliveries, searchTerm, sortField, sortDirection, statusFilter]);

  const paginatedDeliveries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedDeliveries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedDeliveries, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedDeliveries.length / itemsPerPage);

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
      "In Transit": "bg-blue-100 text-blue-700",
      Delivered: "bg-green-100 text-green-700",
      Failed: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Delivery Notes</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Track goods delivered to customers</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => { setEditingId(null); setForm({}); setFormErrors({}); }}
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-blue-200 transition"
            >
              New Delivery Note
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Delivery Note" : "Add Delivery Note"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label htmlFor="deliveryNo">Delivery No <span className="text-red-500">*</span></Label>
                <Input
                  id="deliveryNo"
                  value={form.deliveryNo ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, deliveryNo: e.target.value }))}
                  className={formErrors.deliveryNo ? "border-red-500" : ""}
                />
                {formErrors.deliveryNo && <p className="text-xs text-red-500">{formErrors.deliveryNo}</p>}
              </div>
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
                <Label htmlFor="deliveredBy">Delivered By <span className="text-red-500">*</span></Label>
                <Input
                  id="deliveredBy"
                  value={form.deliveredBy ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, deliveredBy: e.target.value }))}
                  className={formErrors.deliveredBy ? "border-red-500" : ""}
                />
                {formErrors.deliveredBy && <p className="text-xs text-red-500">{formErrors.deliveredBy}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                <select
                  id="status"
                  value={form.status ?? "Pending"}
                  onChange={(e) => setForm(f => ({ ...f, status: e.target.value as DeliveryNote["status"] }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Failed">Failed</option>
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
                onClick={saveDelivery}
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
          <CardHeader><CardTitle>Total Deliveries</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{deliveries.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>In Transit</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-blue-600">
            {deliveries.filter(d => d.status === "In Transit").length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Delivered</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">
            {deliveries.filter(d => d.status === "Delivered").length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pending</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-gray-600">
            {deliveries.filter(d => d.status === "Pending").length}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>Delivery Note List</CardTitle>
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
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Failed">Failed</option>
              </select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
                <Input
                  placeholder="Search deliveries..."
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
                    <button onClick={() => handleSort("deliveryNo")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Delivery No <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
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
                    <button onClick={() => handleSort("deliveryDate")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Delivery Date <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>Delivered By</TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("status")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Status <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDeliveries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-[var(--color-muted-foreground)]">
                      {searchTerm || statusFilter !== "all" ? "No deliveries found" : "No deliveries yet"}
                    </TableCell>
                  </TableRow>
                )}
                {paginatedDeliveries.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.deliveryNo}</TableCell>
                    <TableCell>{d.orderNo}</TableCell>
                    <TableCell>{d.customerName}</TableCell>
                    <TableCell>{d.deliveryDate}</TableCell>
                    <TableCell>{d.deliveredBy}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(d.status)}`}>
                        {d.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <button onClick={() => onEdit(d)} className="inline-block bg-green-100 text-green-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-green-200 transition">
                        Edit
                      </button>
                      <button onClick={() => onDelete(d.id)} className="inline-block bg-red-100 text-red-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-red-200 transition">
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedDeliveries.length)} of {filteredAndSortedDeliveries.length} deliveries
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