"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, TruckIcon, Download } from "lucide-react";
import { toast } from "sonner";

interface ReturnDeliveryNote {
  id: number;
  returnNo: string;
  originalDeliveryNo: string;
  customerName: string;
  returnDate: string;
  items: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected" | "Completed";
}

type SortField = "returnNo" | "originalDeliveryNo" | "customerName" | "returnDate" | "status";
type SortDirection = "asc" | "desc";

export default function ReturnDeliveryNotePage() {
  const [returns, setReturns] = useState<ReturnDeliveryNote[]>([
    { id: 1, returnNo: "RDN-2025-001", originalDeliveryNo: "DN-2025-001", customerName: "Ocean Fresh Seafood", returnDate: "2025-01-16", items: "Fresh Salmon (5kg)", reason: "Quality issue", status: "Approved" },
    { id: 2, returnNo: "RDN-2025-002", originalDeliveryNo: "DN-2025-002", customerName: "Marine Delights Ltd", returnDate: "2025-01-18", items: "Shrimp (10kg)", reason: "Wrong item delivered", status: "Completed" },
    { id: 3, returnNo: "RDN-2025-003", originalDeliveryNo: "DN-2025-003", customerName: "Coastal Distributors", returnDate: "2025-01-20", items: "Cod (5kg)", reason: "Damaged packaging", status: "Pending" },
    { id: 4, returnNo: "RDN-2025-004", originalDeliveryNo: "DN-2025-004", customerName: "Bay Area Wholesalers", returnDate: "2025-01-22", items: "Lobster (2kg)", reason: "Customer changed mind", status: "Rejected" },
  ]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<ReturnDeliveryNote>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("returnNo");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const itemsPerPage = 10;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.returnNo?.trim()) errors.returnNo = "Return number is required";
    if (!form.originalDeliveryNo?.trim()) errors.originalDeliveryNo = "Original delivery number is required";
    if (!form.customerName?.trim()) errors.customerName = "Customer name is required";
    if (!form.returnDate) errors.returnDate = "Return date is required";
    if (!form.items?.trim()) errors.items = "Items are required";
    if (!form.reason?.trim()) errors.reason = "Reason is required";
    if (!form.status) errors.status = "Status is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveReturn = () => {
    if (!validateForm()) {
      toast.error("Please fix form errors");
      return;
    }

    const payload: ReturnDeliveryNote = {
      id: editingId ?? Math.max(0, ...returns.map(r => r.id)) + 1,
      returnNo: String(form.returnNo ?? ""),
      originalDeliveryNo: String(form.originalDeliveryNo ?? ""),
      customerName: String(form.customerName ?? ""),
      returnDate: String(form.returnDate ?? ""),
      items: String(form.items ?? ""),
      reason: String(form.reason ?? ""),
      status: (form.status ?? "Pending") as ReturnDeliveryNote["status"],
    };

    if (editingId) {
      setReturns(prev => prev.map(r => r.id === editingId ? payload : r));
      toast.success("Return delivery note updated successfully");
    } else {
      setReturns(prev => [payload, ...prev]);
      toast.success("Return delivery note created successfully");
    }

    setOpen(false);
    setEditingId(null);
    setForm({});
    setFormErrors({});
  };

  const onEdit = (returnNote: ReturnDeliveryNote) => {
    setForm(returnNote);
    setEditingId(returnNote.id);
    setFormErrors({});
    setOpen(true);
  };

  const onDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this return delivery note?")) return;
    setReturns(prev => prev.filter(r => r.id !== id));
    toast.success("Return delivery note deleted successfully");
  };

  const filteredAndSortedReturns = useMemo(() => {
    let filtered = returns.filter(r =>
      (statusFilter === "all" || r.status === statusFilter) &&
      (r.returnNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
       r.originalDeliveryNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
       r.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
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
  }, [returns, searchTerm, sortField, sortDirection, statusFilter]);

  const paginatedReturns = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedReturns.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedReturns, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedReturns.length / itemsPerPage);

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
      Approved: "bg-green-100 text-green-700",
      Rejected: "bg-red-100 text-red-700",
      Completed: "bg-blue-100 text-blue-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Return Delivery Notes</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Manage returns from customers</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => { setEditingId(null); setForm({}); setFormErrors({}); }}
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-blue-200 transition"
            >
              New Return Note
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Return Delivery Note" : "Add Return Delivery Note"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label htmlFor="returnNo">Return No <span className="text-red-500">*</span></Label>
                <Input
                  id="returnNo"
                  value={form.returnNo ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, returnNo: e.target.value }))}
                  className={formErrors.returnNo ? "border-red-500" : ""}
                />
                {formErrors.returnNo && <p className="text-xs text-red-500">{formErrors.returnNo}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="originalDeliveryNo">Original Delivery No <span className="text-red-500">*</span></Label>
                <Input
                  id="originalDeliveryNo"
                  value={form.originalDeliveryNo ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, originalDeliveryNo: e.target.value }))}
                  className={formErrors.originalDeliveryNo ? "border-red-500" : ""}
                />
                {formErrors.originalDeliveryNo && <p className="text-xs text-red-500">{formErrors.originalDeliveryNo}</p>}
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
                <Label htmlFor="returnDate">Return Date <span className="text-red-500">*</span></Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={form.returnDate ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, returnDate: e.target.value }))}
                  className={formErrors.returnDate ? "border-red-500" : ""}
                />
                {formErrors.returnDate && <p className="text-xs text-red-500">{formErrors.returnDate}</p>}
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
                  onChange={(e) => setForm(f => ({ ...f, status: e.target.value as ReturnDeliveryNote["status"] }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed</option>
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
                onClick={saveReturn}
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
          <CardHeader><CardTitle>Total Returns</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{returns.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pending</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-gray-600">
            {returns.filter(r => r.status === "Pending").length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Approved</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">
            {returns.filter(r => r.status === "Approved").length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Completed</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-blue-600">
            {returns.filter(r => r.status === "Completed").length}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>Return Delivery Note List</CardTitle>
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
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
              </select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
                <Input
                  placeholder="Search returns..."
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
                    <button onClick={() => handleSort("returnNo")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Return No <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("originalDeliveryNo")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Original Delivery <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("customerName")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Customer <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("returnDate")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Return Date <ArrowUpDown className="ml-2 h-3 w-3 inline" />
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
                {paginatedReturns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-[var(--color-muted-foreground)]">
                      {searchTerm || statusFilter !== "all" ? "No returns found" : "No returns yet"}
                    </TableCell>
                  </TableRow>
                )}
                {paginatedReturns.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.returnNo}</TableCell>
                    <TableCell>{r.originalDeliveryNo}</TableCell>
                    <TableCell>{r.customerName}</TableCell>
                    <TableCell>{r.returnDate}</TableCell>
                    <TableCell>{r.reason}</TableCell>
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedReturns.length)} of {filteredAndSortedReturns.length} returns
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