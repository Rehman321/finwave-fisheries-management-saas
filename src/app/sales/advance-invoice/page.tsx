"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, DollarSign, Download } from "lucide-react";
import { toast } from "sonner";

interface AdvanceInvoice {
  id: number;
  invoiceNo: string;
  customerName: string;
  orderNo: string;
  date: string;
  advanceAmount: number;
  totalAmount: number;
  status: "Pending" | "Paid" | "Partially Paid" | "Overdue";
}

type SortField = "invoiceNo" | "customerName" | "date" | "advanceAmount" | "status";
type SortDirection = "asc" | "desc";

export default function AdvanceInvoicePage() {
  const [invoices, setInvoices] = useState<AdvanceInvoice[]>([
    { id: 1, invoiceNo: "AI-2025-001", customerName: "Ocean Fresh Seafood", orderNo: "SO-2025-001", date: "2025-01-05", advanceAmount: 500, totalAmount: 2500, status: "Paid" },
    { id: 2, invoiceNo: "AI-2025-002", customerName: "Marine Delights Ltd", orderNo: "SO-2025-002", date: "2025-01-08", advanceAmount: 800, totalAmount: 3200, status: "Partially Paid" },
    { id: 3, invoiceNo: "AI-2025-003", customerName: "Coastal Distributors", orderNo: "SO-2025-003", date: "2025-01-10", advanceAmount: 400, totalAmount: 1800, status: "Pending" },
    { id: 4, invoiceNo: "AI-2025-004", customerName: "Bay Area Wholesalers", orderNo: "SO-2025-004", date: "2025-01-12", advanceAmount: 1000, totalAmount: 4500, status: "Paid" },
    { id: 5, invoiceNo: "AI-2025-005", customerName: "Harbor Foods Inc", orderNo: "SO-2025-005", date: "2024-12-28", advanceAmount: 300, totalAmount: 1200, status: "Overdue" },
  ]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<AdvanceInvoice>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("invoiceNo");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const itemsPerPage = 10;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.invoiceNo?.trim()) errors.invoiceNo = "Invoice number is required";
    if (!form.customerName?.trim()) errors.customerName = "Customer name is required";
    if (!form.orderNo?.trim()) errors.orderNo = "Order number is required";
    if (!form.date) errors.date = "Date is required";
    if (!form.advanceAmount || form.advanceAmount <= 0) errors.advanceAmount = "Advance amount must be greater than 0";
    if (!form.totalAmount || form.totalAmount <= 0) errors.totalAmount = "Total amount must be greater than 0";
    if (form.advanceAmount && form.totalAmount && form.advanceAmount > form.totalAmount) {
      errors.advanceAmount = "Advance amount cannot exceed total amount";
    }
    if (!form.status) errors.status = "Status is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveInvoice = () => {
    if (!validateForm()) {
      toast.error("Please fix form errors");
      return;
    }

    const payload: AdvanceInvoice = {
      id: editingId ?? Math.max(0, ...invoices.map(i => i.id)) + 1,
      invoiceNo: String(form.invoiceNo ?? ""),
      customerName: String(form.customerName ?? ""),
      orderNo: String(form.orderNo ?? ""),
      date: String(form.date ?? ""),
      advanceAmount: Number(form.advanceAmount ?? 0),
      totalAmount: Number(form.totalAmount ?? 0),
      status: (form.status ?? "Pending") as AdvanceInvoice["status"],
    };

    if (editingId) {
      setInvoices(prev => prev.map(i => i.id === editingId ? payload : i));
      toast.success("Advance invoice updated successfully");
    } else {
      setInvoices(prev => [payload, ...prev]);
      toast.success("Advance invoice created successfully");
    }

    setOpen(false);
    setEditingId(null);
    setForm({});
    setFormErrors({});
  };

  const onEdit = (invoice: AdvanceInvoice) => {
    setForm(invoice);
    setEditingId(invoice.id);
    setFormErrors({});
    setOpen(true);
  };

  const onDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this advance invoice?")) return;
    setInvoices(prev => prev.filter(i => i.id !== id));
    toast.success("Advance invoice deleted successfully");
  };

  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = invoices.filter(i =>
      (statusFilter === "all" || i.status === statusFilter) &&
      (i.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
       i.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       i.orderNo.toLowerCase().includes(searchTerm.toLowerCase()))
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
  }, [invoices, searchTerm, sortField, sortDirection, statusFilter]);

  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedInvoices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedInvoices, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedInvoices.length / itemsPerPage);

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
      Paid: "bg-green-100 text-green-700",
      "Partially Paid": "bg-yellow-100 text-yellow-700",
      Overdue: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Advance Invoices</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Manage advance payment invoices</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => { setEditingId(null); setForm({}); setFormErrors({}); }}
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-blue-200 transition"
            >
              New Advance Invoice
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Advance Invoice" : "Add Advance Invoice"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label htmlFor="invoiceNo">Invoice No <span className="text-red-500">*</span></Label>
                <Input
                  id="invoiceNo"
                  value={form.invoiceNo ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, invoiceNo: e.target.value }))}
                  className={formErrors.invoiceNo ? "border-red-500" : ""}
                />
                {formErrors.invoiceNo && <p className="text-xs text-red-500">{formErrors.invoiceNo}</p>}
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
                <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
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
                <Label htmlFor="advanceAmount">Advance Amount <span className="text-red-500">*</span></Label>
                <Input
                  id="advanceAmount"
                  type="number"
                  step="0.01"
                  value={form.advanceAmount ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, advanceAmount: parseFloat(e.target.value) || 0 }))}
                  className={formErrors.advanceAmount ? "border-red-500" : ""}
                />
                {formErrors.advanceAmount && <p className="text-xs text-red-500">{formErrors.advanceAmount}</p>}
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
                  onChange={(e) => setForm(f => ({ ...f, status: e.target.value as AdvanceInvoice["status"] }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Overdue">Overdue</option>
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
                onClick={saveInvoice}
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
          <CardHeader><CardTitle>Total Invoices</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{invoices.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Advance</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-blue-600">
            ${invoices.reduce((sum, i) => sum + i.advanceAmount, 0).toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Paid</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">
            {invoices.filter(i => i.status === "Paid").length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Overdue</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">
            {invoices.filter(i => i.status === "Overdue").length}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>Advance Invoice List</CardTitle>
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
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
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
                    <button onClick={() => handleSort("invoiceNo")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Invoice No <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("customerName")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Customer <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>Order No</TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("date")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Date <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("advanceAmount")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Advance Amount <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("status")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Status <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-[var(--color-muted-foreground)]">
                      {searchTerm || statusFilter !== "all" ? "No invoices found" : "No invoices yet"}
                    </TableCell>
                  </TableRow>
                )}
                {paginatedInvoices.map(i => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.invoiceNo}</TableCell>
                    <TableCell>{i.customerName}</TableCell>
                    <TableCell>{i.orderNo}</TableCell>
                    <TableCell>{i.date}</TableCell>
                    <TableCell className="font-semibold">${i.advanceAmount.toFixed(2)}</TableCell>
                    <TableCell>${i.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(i.status)}`}>
                        {i.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <button onClick={() => onEdit(i)} className="inline-block bg-green-100 text-green-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-green-200 transition">
                        Edit
                      </button>
                      <button onClick={() => onDelete(i.id)} className="inline-block bg-red-100 text-red-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-red-200 transition">
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedInvoices.length)} of {filteredAndSortedInvoices.length} invoices
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