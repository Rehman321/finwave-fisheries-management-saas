"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, RotateCcw, Download } from "lucide-react";
import { toast } from "sonner";

interface RefundInvoice {
  id: number;
  refundNo: string;
  customerName: string;
  originalInvoiceNo: string;
  refundDate: string;
  refundAmount: number;
  reason: string;
  status: "Pending" | "Approved" | "Processed" | "Rejected";
}

type SortField = "refundNo" | "customerName" | "refundDate" | "refundAmount" | "status";
type SortDirection = "asc" | "desc";

export default function RefundInvoicePage() {
  const [refunds, setRefunds] = useState<RefundInvoice[]>([
    { id: 1, refundNo: "RF-2025-001", customerName: "Ocean Fresh Seafood", originalInvoiceNo: "INV-2025-001", refundDate: "2025-01-16", refundAmount: 250, reason: "Product quality issue", status: "Processed" },
    { id: 2, refundNo: "RF-2025-002", customerName: "Marine Delights Ltd", originalInvoiceNo: "INV-2025-002", refundDate: "2025-01-18", refundAmount: 500, reason: "Order cancelled", status: "Approved" },
    { id: 3, refundNo: "RF-2025-003", customerName: "Coastal Distributors", originalInvoiceNo: "INV-2025-003", refundDate: "2025-01-20", refundAmount: 180, reason: "Duplicate payment", status: "Pending" },
    { id: 4, refundNo: "RF-2025-004", customerName: "Bay Area Wholesalers", originalInvoiceNo: "INV-2025-004", refundDate: "2025-01-22", refundAmount: 450, reason: "Wrong item delivered", status: "Processed" },
    { id: 5, refundNo: "RF-2025-005", customerName: "Harbor Foods Inc", originalInvoiceNo: "INV-2025-005", refundDate: "2025-01-12", refundAmount: 120, reason: "Customer dissatisfaction", status: "Rejected" },
  ]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<RefundInvoice>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("refundNo");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const itemsPerPage = 10;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.refundNo?.trim()) errors.refundNo = "Refund number is required";
    if (!form.customerName?.trim()) errors.customerName = "Customer name is required";
    if (!form.originalInvoiceNo?.trim()) errors.originalInvoiceNo = "Original invoice number is required";
    if (!form.refundDate) errors.refundDate = "Refund date is required";
    if (!form.refundAmount || form.refundAmount <= 0) errors.refundAmount = "Refund amount must be greater than 0";
    if (!form.reason?.trim()) errors.reason = "Reason is required";
    if (!form.status) errors.status = "Status is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveRefund = () => {
    if (!validateForm()) {
      toast.error("Please fix form errors");
      return;
    }

    const payload: RefundInvoice = {
      id: editingId ?? Math.max(0, ...refunds.map(r => r.id)) + 1,
      refundNo: String(form.refundNo ?? ""),
      customerName: String(form.customerName ?? ""),
      originalInvoiceNo: String(form.originalInvoiceNo ?? ""),
      refundDate: String(form.refundDate ?? ""),
      refundAmount: Number(form.refundAmount ?? 0),
      reason: String(form.reason ?? ""),
      status: (form.status ?? "Pending") as RefundInvoice["status"],
    };

    if (editingId) {
      setRefunds(prev => prev.map(r => r.id === editingId ? payload : r));
      toast.success("Refund invoice updated successfully");
    } else {
      setRefunds(prev => [payload, ...prev]);
      toast.success("Refund invoice created successfully");
    }

    setOpen(false);
    setEditingId(null);
    setForm({});
    setFormErrors({});
  };

  const onEdit = (refund: RefundInvoice) => {
    setForm(refund);
    setEditingId(refund.id);
    setFormErrors({});
    setOpen(true);
  };

  const onDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this refund invoice?")) return;
    setRefunds(prev => prev.filter(r => r.id !== id));
    toast.success("Refund invoice deleted successfully");
  };

  const filteredAndSortedRefunds = useMemo(() => {
    let filtered = refunds.filter(r =>
      (statusFilter === "all" || r.status === statusFilter) &&
      (r.refundNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
       r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       r.originalInvoiceNo.toLowerCase().includes(searchTerm.toLowerCase()))
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
  }, [refunds, searchTerm, sortField, sortDirection, statusFilter]);

  const paginatedRefunds = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedRefunds.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedRefunds, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedRefunds.length / itemsPerPage);

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
      Approved: "bg-blue-100 text-blue-700",
      Processed: "bg-green-100 text-green-700",
      Rejected: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Refund Invoices</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Process customer refunds</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => { setEditingId(null); setForm({}); setFormErrors({}); }}
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-blue-200 transition"
            >
              New Refund Invoice
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Refund Invoice" : "Add Refund Invoice"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label htmlFor="refundNo">Refund No <span className="text-red-500">*</span></Label>
                <Input
                  id="refundNo"
                  value={form.refundNo ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, refundNo: e.target.value }))}
                  className={formErrors.refundNo ? "border-red-500" : ""}
                />
                {formErrors.refundNo && <p className="text-xs text-red-500">{formErrors.refundNo}</p>}
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
                <Label htmlFor="originalInvoiceNo">Original Invoice No <span className="text-red-500">*</span></Label>
                <Input
                  id="originalInvoiceNo"
                  value={form.originalInvoiceNo ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, originalInvoiceNo: e.target.value }))}
                  className={formErrors.originalInvoiceNo ? "border-red-500" : ""}
                />
                {formErrors.originalInvoiceNo && <p className="text-xs text-red-500">{formErrors.originalInvoiceNo}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="refundDate">Refund Date <span className="text-red-500">*</span></Label>
                <Input
                  id="refundDate"
                  type="date"
                  value={form.refundDate ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, refundDate: e.target.value }))}
                  className={formErrors.refundDate ? "border-red-500" : ""}
                />
                {formErrors.refundDate && <p className="text-xs text-red-500">{formErrors.refundDate}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="refundAmount">Refund Amount <span className="text-red-500">*</span></Label>
                <Input
                  id="refundAmount"
                  type="number"
                  step="0.01"
                  value={form.refundAmount ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, refundAmount: parseFloat(e.target.value) || 0 }))}
                  className={formErrors.refundAmount ? "border-red-500" : ""}
                />
                {formErrors.refundAmount && <p className="text-xs text-red-500">{formErrors.refundAmount}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reason">Reason <span className="text-red-500">*</span></Label>
                <Input
                  id="reason"
                  value={form.reason ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}
                  className={formErrors.reason ? "border-red-500" : ""}
                />
                {formErrors.reason && <p className="text-xs text-red-500">{formErrors.reason}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                <select
                  id="status"
                  value={form.status ?? "Pending"}
                  onChange={(e) => setForm(f => ({ ...f, status: e.target.value as RefundInvoice["status"] }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Processed">Processed</option>
                  <option value="Rejected">Rejected</option>
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
                onClick={saveRefund}
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
          <CardHeader><CardTitle>Total Refunds</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{refunds.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Amount</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">
            ${refunds.reduce((sum, r) => sum + r.refundAmount, 0).toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Processed</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">
            {refunds.filter(r => r.status === "Processed").length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pending</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-gray-600">
            {refunds.filter(r => r.status === "Pending").length}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>Refund Invoice List</CardTitle>
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
                <option value="Approved">Approved</option>
                <option value="Processed">Processed</option>
                <option value="Rejected">Rejected</option>
              </select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
                <Input
                  placeholder="Search refunds..."
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
                    <button onClick={() => handleSort("refundNo")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Refund No <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("customerName")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Customer <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>Original Invoice</TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("refundDate")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Refund Date <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("refundAmount")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Amount <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("status")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Status <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRefunds.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-[var(--color-muted-foreground)]">
                      {searchTerm || statusFilter !== "all" ? "No refunds found" : "No refunds yet"}
                    </TableCell>
                  </TableRow>
                )}
                {paginatedRefunds.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.refundNo}</TableCell>
                    <TableCell>{r.customerName}</TableCell>
                    <TableCell>{r.originalInvoiceNo}</TableCell>
                    <TableCell>{r.refundDate}</TableCell>
                    <TableCell className="font-semibold text-red-600">${r.refundAmount.toFixed(2)}</TableCell>
                    <TableCell className="max-w-xs truncate">{r.reason}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <button onClick={() => onEdit(r)} className="inline-block bg-green-100 text-green-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-green-200 transition">
                        Edit
                      </button>
                      <button onClick={() => onDelete(r.id)} className="inline-block bg-red-100 text-red-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-red-200 transition">
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedRefunds.length)} of {filteredAndSortedRefunds.length} refunds
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