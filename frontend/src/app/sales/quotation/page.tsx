"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, FileText, Download } from "lucide-react";
import { toast } from "sonner";

interface Quotation {
  id: number;
  quotationNo: string;
  customerName: string;
  date: string;
  validUntil: string;
  items: string;
  totalAmount: number;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
}

type SortField = "quotationNo" | "customerName" | "date" | "totalAmount" | "status";
type SortDirection = "asc" | "desc";

export default function QuotationPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([
    { id: 1, quotationNo: "QT-2025-001", customerName: "Ocean Fresh Seafood", date: "2025-01-05", validUntil: "2025-02-05", items: "Fresh Salmon (50kg), Tuna (30kg)", totalAmount: 2500, status: "Sent" },
    { id: 2, quotationNo: "QT-2025-002", customerName: "Marine Delights Ltd", date: "2025-01-08", validUntil: "2025-02-08", items: "Shrimp (100kg), Crab (20kg)", totalAmount: 3200, status: "Accepted" },
    { id: 3, quotationNo: "QT-2025-003", customerName: "Coastal Distributors", date: "2025-01-10", validUntil: "2025-02-10", items: "Cod (40kg), Mackerel (60kg)", totalAmount: 1800, status: "Draft" },
    { id: 4, quotationNo: "QT-2025-004", customerName: "Bay Area Wholesalers", date: "2025-01-12", validUntil: "2025-02-12", items: "Lobster (15kg), Oysters (25kg)", totalAmount: 4500, status: "Sent" },
    { id: 5, quotationNo: "QT-2025-005", customerName: "Harbor Foods Inc", date: "2024-12-20", validUntil: "2025-01-20", items: "Halibut (35kg)", totalAmount: 1200, status: "Expired" },
  ]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Quotation>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("quotationNo");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const itemsPerPage = 10;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.quotationNo?.trim()) errors.quotationNo = "Quotation number is required";
    if (!form.customerName?.trim()) errors.customerName = "Customer name is required";
    if (!form.date) errors.date = "Date is required";
    if (!form.validUntil) errors.validUntil = "Valid until date is required";
    if (!form.items?.trim()) errors.items = "Items are required";
    if (!form.totalAmount || form.totalAmount <= 0) errors.totalAmount = "Total amount must be greater than 0";
    if (!form.status) errors.status = "Status is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveQuotation = () => {
    if (!validateForm()) {
      toast.error("Please fix form errors");
      return;
    }

    const payload: Quotation = {
      id: editingId ?? Math.max(0, ...quotations.map(q => q.id)) + 1,
      quotationNo: String(form.quotationNo ?? ""),
      customerName: String(form.customerName ?? ""),
      date: String(form.date ?? ""),
      validUntil: String(form.validUntil ?? ""),
      items: String(form.items ?? ""),
      totalAmount: Number(form.totalAmount ?? 0),
      status: (form.status ?? "Draft") as Quotation["status"],
    };

    if (editingId) {
      setQuotations(prev => prev.map(q => q.id === editingId ? payload : q));
      toast.success("Quotation updated successfully");
    } else {
      setQuotations(prev => [payload, ...prev]);
      toast.success("Quotation created successfully");
    }

    setOpen(false);
    setEditingId(null);
    setForm({});
    setFormErrors({});
  };

  const onEdit = (quotation: Quotation) => {
    setForm(quotation);
    setEditingId(quotation.id);
    setFormErrors({});
    setOpen(true);
  };

  const onDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this quotation?")) return;
    setQuotations(prev => prev.filter(q => q.id !== id));
    toast.success("Quotation deleted successfully");
  };

  const filteredAndSortedQuotations = useMemo(() => {
    let filtered = quotations.filter(q =>
      (statusFilter === "all" || q.status === statusFilter) &&
      (q.quotationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
       q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       q.items.toLowerCase().includes(searchTerm.toLowerCase()))
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
  }, [quotations, searchTerm, sortField, sortDirection, statusFilter]);

  const paginatedQuotations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedQuotations.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedQuotations, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedQuotations.length / itemsPerPage);

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
      Draft: "bg-gray-100 text-gray-700",
      Sent: "bg-blue-100 text-blue-700",
      Accepted: "bg-green-100 text-green-700",
      Rejected: "bg-red-100 text-red-700",
      Expired: "bg-orange-100 text-orange-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Quotations</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Create and manage sales quotations</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => { setEditingId(null); setForm({}); setFormErrors({}); }}
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-blue-200 transition"
            >
              New Quotation
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Quotation" : "Add Quotation"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label htmlFor="quotationNo">Quotation No <span className="text-red-500">*</span></Label>
                <Input
                  id="quotationNo"
                  value={form.quotationNo ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, quotationNo: e.target.value }))}
                  className={formErrors.quotationNo ? "border-red-500" : ""}
                />
                {formErrors.quotationNo && <p className="text-xs text-red-500">{formErrors.quotationNo}</p>}
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
                <Label htmlFor="validUntil">Valid Until <span className="text-red-500">*</span></Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={form.validUntil ?? ""}
                  onChange={(e) => setForm(f => ({ ...f, validUntil: e.target.value }))}
                  className={formErrors.validUntil ? "border-red-500" : ""}
                />
                {formErrors.validUntil && <p className="text-xs text-red-500">{formErrors.validUntil}</p>}
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
                  value={form.status ?? "Draft"}
                  onChange={(e) => setForm(f => ({ ...f, status: e.target.value as Quotation["status"] }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Expired">Expired</option>
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
                onClick={saveQuotation}
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
          <CardHeader><CardTitle>Total Quotations</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{quotations.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Accepted</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">
            {quotations.filter(q => q.status === "Accepted").length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pending</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-blue-600">
            {quotations.filter(q => q.status === "Sent").length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Value</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">
            ${quotations.reduce((sum, q) => sum + q.totalAmount, 0).toFixed(2)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>Quotation List</CardTitle>
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
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Expired">Expired</option>
              </select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
                <Input
                  placeholder="Search quotations..."
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
                    <button onClick={() => handleSort("quotationNo")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Quotation No <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("customerName")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Customer <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => handleSort("date")} className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition">
                      Date <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>Valid Until</TableHead>
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
                {paginatedQuotations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-[var(--color-muted-foreground)]">
                      {searchTerm || statusFilter !== "all" ? "No quotations found" : "No quotations yet"}
                    </TableCell>
                  </TableRow>
                )}
                {paginatedQuotations.map(q => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.quotationNo}</TableCell>
                    <TableCell>{q.customerName}</TableCell>
                    <TableCell>{q.date}</TableCell>
                    <TableCell>{q.validUntil}</TableCell>
                    <TableCell>${q.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(q.status)}`}>
                        {q.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <button onClick={() => onEdit(q)} className="inline-block bg-green-100 text-green-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-green-200 transition">
                        Edit
                      </button>
                      <button onClick={() => onDelete(q.id)} className="inline-block bg-red-100 text-red-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-red-200 transition">
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedQuotations.length)} of {filteredAndSortedQuotations.length} quotations
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