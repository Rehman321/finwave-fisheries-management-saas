"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, AlertCircle, Download } from "lucide-react";
import { toast } from "sonner";

interface ArrearsInvoice {
  id: number;
  invoiceNo: string;
  customerName: string;
  orderNo: string;
  originalDueDate: string;
  overdueAmount: number;
  daysOverdue: number;
  status: "Overdue" | "Paid" | "Partially Paid" | "Written Off";
}

type SortField = "invoiceNo" | "customerName" | "originalDueDate" | "overdueAmount" | "daysOverdue" | "status";
type SortDirection = "asc" | "desc";

export default function ArrearsInvoicePage() {
  const [invoices, setInvoices] = useState<ArrearsInvoice[]>([
    { id: 1, invoiceNo: "ARI-2024-001", customerName: "Ocean Fresh Seafood", orderNo: "SO-2024-050", originalDueDate: "2024-12-15", overdueAmount: 1500, daysOverdue: 21, status: "Overdue" },
    { id: 2, invoiceNo: "ARI-2024-002", customerName: "Marine Delights Ltd", orderNo: "SO-2024-055", originalDueDate: "2024-12-20", overdueAmount: 2200, daysOverdue: 16, status: "Partially Paid" },
    { id: 3, invoiceNo: "ARI-2024-003", customerName: "Coastal Distributors", orderNo: "SO-2024-060", originalDueDate: "2024-11-30", overdueAmount: 980, daysOverdue: 36, status: "Paid" },
    { id: 4, invoiceNo: "ARI-2024-004", customerName: "Bay Area Wholesalers", orderNo: "SO-2024-065", originalDueDate: "2024-12-10", overdueAmount: 3400, daysOverdue: 26, status: "Overdue" },
    { id: 5, invoiceNo: "ARI-2024-005", customerName: "Harbor Foods Inc", orderNo: "SO-2024-070", originalDueDate: "2024-10-20", overdueAmount: 750, daysOverdue: 77, status: "Written Off" },
  ]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<ArrearsInvoice>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("daysOverdue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const itemsPerPage = 10;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.invoiceNo?.trim()) errors.invoiceNo = "Invoice number is required";
    if (!form.customerName?.trim()) errors.customerName = "Customer name is required";
    if (!form.orderNo?.trim()) errors.orderNo = "Order number is required";
    if (!form.originalDueDate) errors.originalDueDate = "Original due date is required";
    if (!form.overdueAmount || form.overdueAmount <= 0) errors.overdueAmount = "Overdue amount must be greater than 0";
    if (form.daysOverdue === undefined || form.daysOverdue < 0) errors.daysOverdue = "Days overdue must be 0 or more";
    if (!form.status) errors.status = "Status is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveInvoice = () => {
    if (!validateForm()) {
      toast.error("Please fix form errors");
      return;
    }

    const payload: ArrearsInvoice = {
      id: editingId ?? Math.max(0, ...invoices.map(i => i.id)) + 1,
      invoiceNo: String(form.invoiceNo ?? ""),
      customerName: String(form.customerName ?? ""),
      orderNo: String(form.orderNo ?? ""),
      originalDueDate: String(form.originalDueDate ?? ""),
      overdueAmount: Number(form.overdueAmount ?? 0),
      daysOverdue: Number(form.daysOverdue ?? 0),
      status: (form.status ?? "Overdue") as ArrearsInvoice["status"],
    };

    if (editingId) {
      setInvoices(prev => prev.map(i => i.id === editingId ? payload : i));
      toast.success("Arrears invoice updated successfully");
    } else {
      setInvoices(prev => [payload, ...prev]);
      toast.success("Arrears invoice created successfully");
    }

    setOpen(false);
    setEditingId(null);
    setForm({});
    setFormErrors({});
  };

  const onEdit = (invoice: ArrearsInvoice) => {
    setForm(invoice);
    setEditingId(invoice.id);
    setFormErrors({});
    setOpen(true);
  };

  const onDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this arrears invoice?")) return;
    setInvoices(prev => prev.filter(i => i.id !== id));
    toast.success("Arrears invoice deleted successfully");
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
      Overdue: "bg-red-100 text-red-700",
      Paid: "bg-green-100 text-green-700",
      "Partially Paid": "bg-yellow-100 text-yellow-700",
      "Written Off": "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Arrears Invoices</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Manage overdue payment invoices</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => { setEditingId(null); setForm({}); setFormErrors({}); }}
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-blue-200 transition"
            >
              New Arrears Invoice
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Arrears Invoice" : "Add Arrears Invoice"}</DialogTitle>
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
                <Label htmlFor="originalDueDate">Original Due Date <span className="text-red-500">*</span></Label>
                <Input
                  id="originalDueDate"
                  type="date"
                  value={form.originalDueDate ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, originalDueDate: e.target.value }))}
                  className={formErrors.originalDueDate ? "border-red-500" : ""}
                />
                {formErrors.originalDueDate && <p className="text-xs text-red-500">{formErrors.originalDueDate}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="overdueAmount">Overdue Amount <span className="text-red-500">*</span></Label>
                <Input
                  id="overdueAmount"
                  type="number"
                  step="0.01"
                  value={form.overdueAmount ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, overdueAmount: parseFloat(e.target.value) || 0 }))}
                  className={formErrors.overdueAmount ? "border-red-500" : ""}
                />
                {formErrors.overdueAmount && <p className="text-xs text-red-500">{formErrors.overdueAmount}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="daysOverdue">Days Overdue <span className="text-red-500">*</span></Label>
                <Input
                  id="daysOverdue"
                  type="number"
                  value={form.daysOverdue ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, daysOverdue: parseInt(e.target.value) || 0 }))}
                  className={formErrors.daysOverdue ? "border-red-500" : ""}
                />
                {formErrors.daysOverdue && <p className="text-xs text-red-500">{formErrors.daysOverdue}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                <select
                  id="status"
                  value={form.status ?? "Overdue"}
                  onChange={(e) => setForm(f => ({ ...f, status: e.target.value as ArrearsInvoice["status"] }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Overdue">Overdue</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Written Off">Written Off</option>
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
          <CardHeader><CardTitle>Total Overdue</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">
            ${invoices.reduce((sum, i) => sum + i.overdueAmount, 0).toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Active Arrears</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">
            {invoices.filter(i => i.status === "Overdue").length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Avg Days Overdue</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">
            {invoices.length > 0 ? Math.round(invoices.reduce((sum, i) => sum + i.daysOverdue, 0) / invoices.length) : 0} days
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Written Off</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-gray-600">
            {invoices.filter(i => i.status === "Written Off").length}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>Arrears Invoice List</CardTitle>
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
                <option value="Overdue">Overdue</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Written Off">Written Off</option>
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
                    <button onClick={() => handleSort("originalDueDate")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Due Date <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("overdueAmount")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Overdue Amount <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("daysOverdue")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Days Overdue <ArrowUpDown className="ml-2 h-3 w-3 inline" />
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
                    <TableCell>{i.originalDueDate}</TableCell>
                    <TableCell className="font-semibold text-red-600">${i.overdueAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${i.daysOverdue > 30 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {i.daysOverdue} days
                      </span>
                    </TableCell>
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