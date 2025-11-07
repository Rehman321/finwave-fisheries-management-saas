"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useRole } from "@/hooks/useRole";
import { toast } from "sonner";

interface LedgerItem {
  id: number;
  type: "order" | "payment" | "expense" | "misc";
  ref: string;
  description: string;
  amount: number;
  date: string;
  customerName?: string;
  supplierName?: string;
}

interface LedgerFilters {
  dateFrom: string;
  dateTo: string;
  type: string;
  customer: string;
  supplier: string;
  searchTerm: string;
}

export default function LedgerPage() {
  const { can } = useRole();
  const [items, setItems] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ type: "order" | "payment" | "expense" | "misc"; ref: string; description: string; amount: string }>({ 
    type: "payment", 
    ref: "", 
    description: "", 
    amount: "" 
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Filters
  const [filters, setFilters] = useState<LedgerFilters>({
    dateFrom: "",
    dateTo: "",
    type: "all",
    customer: "all",
    supplier: "all",
    searchTerm: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Sorting & Pagination
  const [sortField, setSortField] = useState<"date" | "type" | "ref" | "amount">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/ledger");
        const data = await res.json();
        setItems(data);
      } catch (e: any) {
        toast.error("Failed to load ledger");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filtered data
  const filteredItems = useMemo(() => {
    let filtered = [...items];

    // Search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(item =>
        item.ref.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(item => new Date(item.date) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(item => new Date(item.date) <= new Date(filters.dateTo));
    }

    // Type filter
    if (filters.type !== "all") {
      filtered = filtered.filter(item => item.type === filters.type);
    }

    // Customer filter
    if (filters.customer !== "all") {
      filtered = filtered.filter(item => item.customerName === filters.customer);
    }

    // Supplier filter
    if (filters.supplier !== "all") {
      filtered = filtered.filter(item => item.supplierName === filters.supplier);
    }

    return filtered;
  }, [items, filters]);

  // Sorted data
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems];
    sorted.sort((a, b) => {
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
    return sorted;
  }, [filteredItems, sortField, sortDirection]);

  // Paginated data
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedItems, currentPage]);

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      type: "all",
      customer: "all",
      supplier: "all",
      searchTerm: "",
    });
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    filters.dateFrom,
    filters.dateTo,
    filters.type !== "all",
    filters.customer !== "all",
    filters.supplier !== "all",
    filters.searchTerm,
  ].filter(Boolean).length;

  const income = useMemo(() => filteredItems.filter(i => i.amount > 0).reduce((s, i) => s + i.amount, 0), [filteredItems]);
  const expense = useMemo(() => filteredItems.filter(i => i.amount < 0).reduce((s, i) => s + Math.abs(i.amount), 0), [filteredItems]);
  const net = useMemo(() => income - expense, [income, expense]);

  const saveItem = async () => {
    if (!form.ref.trim() || !form.description.trim() || !form.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      id: editingId ?? Math.max(0, ...items.map(i => i.id)) + 1,
      type: form.type,
      ref: form.ref || `REF-${Math.floor(Math.random() * 10000)}`,
      description: form.description,
      amount: Number(form.amount) || 0,
      date: new Date().toISOString(),
    };

    try {
      if (editingId) {
        setItems(prev => prev.map(i => i.id === editingId ? payload : i));
        await fetch("/api/ledger", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        toast.success("Entry updated successfully");
      } else {
        setItems(prev => [payload, ...prev]);
        await fetch("/api/ledger", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        toast.success("Entry created successfully");
      }
      
      setOpen(false);
      setEditingId(null);
      setForm({ type: "payment", ref: "", description: "", amount: "" });
    } catch (e) {
      toast.error("Failed to save entry");
    }
  };

  const onEdit = (item: LedgerItem) => {
    setForm({ type: item.type, ref: item.ref, description: item.description, amount: String(item.amount) });
    setEditingId(item.id);
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this ledger entry?")) return;
    try {
      setItems(prev => prev.filter(i => i.id !== id));
      await fetch(`/api/ledger?id=${id}`, { method: "DELETE" });
      toast.success("Entry deleted successfully");
    } catch (e) {
      toast.error("Failed to delete entry");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-lg text-[var(--color-muted-foreground)]">Loading ledger…</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Ledger</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Record of all financial transactions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button 
              onClick={() => { setEditingId(null); setForm({ type: "payment", ref: "", description: "", amount: "" }); }} 
              disabled={!can.create}
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Entry
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Entry" : "Add Entry"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Type <span className="text-red-500">*</span></Label>
                <select 
                  value={form.type} 
                  onChange={(e) => setForm(f => ({ ...f, type: e.target.value as "order" | "payment" | "expense" | "misc" }))} 
                  className="rounded-md border border-[var(--color-border)] bg-background px-3 py-2 text-sm"
                >
                  <option value="order">Order</option>
                  <option value="payment">Payment</option>
                  <option value="expense">Expense</option>
                  <option value="misc">Misc</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ref">Reference <span className="text-red-500">*</span></Label>
                <Input id="ref" placeholder="e.g., INV-001" value={form.ref} onChange={(e) => setForm(f => ({ ...f, ref: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                <Input id="description" placeholder="Transaction description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount <span className="text-red-500">*</span></Label>
                <Input id="amount" type="number" step="0.01" placeholder="Positive for income, negative for expense" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} />
                <p className="text-xs text-[var(--color-muted-foreground)]">Enter positive for income, negative for expense</p>
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
                onClick={saveItem}
                className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-indigo-200 transition"
              >
                {editingId ? "Save Changes" : "Add"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total Income</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">${income.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Expenses</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">${expense.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Net Balance</CardTitle></CardHeader>
          <CardContent className={`text-2xl font-bold ${net >= 0 ? "text-green-600" : "text-red-600"}`}>${net.toFixed(2)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
                <Input
                  placeholder="Search transactions..."
                  value={filters.searchTerm}
                  onChange={(e) => {
                    setFilters(f => ({ ...f, searchTerm: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="pl-8"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-2 text-sm font-medium rounded-full hover:bg-gray-200 transition relative"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--chart-3)] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 p-4 bg-[var(--color-muted)] rounded-lg space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="grid gap-2">
                  <Label htmlFor="dateFrom" className="text-xs">Date From</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => {
                      setFilters(f => ({ ...f, dateFrom: e.target.value }));
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dateTo" className="text-xs">Date To</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => {
                      setFilters(f => ({ ...f, dateTo: e.target.value }));
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">Transaction Type</Label>
                  <Select
                    value={filters.type}
                    onValueChange={(val) => {
                      setFilters(f => ({ ...f, type: val }));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="order">Order</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="misc">Misc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">Customer</Label>
                  <Select
                    value={filters.customer}
                    onValueChange={(val) => {
                      setFilters(f => ({ ...f, customer: val }));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      <SelectItem value="Customer 1">Customer 1</SelectItem>
                      <SelectItem value="Customer 2">Customer 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">Supplier</Label>
                  <Select
                    value={filters.supplier}
                    onValueChange={(val) => {
                      setFilters(f => ({ ...f, supplier: val }));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Suppliers</SelectItem>
                      <SelectItem value="Supplier 1">Supplier 1</SelectItem>
                      <SelectItem value="Supplier 2">Supplier 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center text-sm text-[var(--color-muted-foreground)] hover:text-foreground transition"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
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
                      onClick={() => handleSort("type")} 
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Type <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      onClick={() => handleSort("ref")} 
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Reference <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>
                    <button 
                      onClick={() => handleSort("amount")} 
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Amount <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-[var(--color-muted-foreground)]">
                      {activeFiltersCount > 0 ? "No transactions match your filters" : "No transactions yet"}
                    </TableCell>
                  </TableRow>
                )}
                {paginatedItems.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{new Date(i.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize bg-[var(--color-muted)]">
                        {i.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{i.ref}</TableCell>
                    <TableCell>{i.description}</TableCell>
                    <TableCell className={`font-semibold ${i.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {i.amount >= 0 ? "+" : "-"}${Math.abs(i.amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <button 
                        onClick={() => onEdit(i)} 
                        disabled={!can.update}
                        className="inline-block bg-green-100 text-green-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-green-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => onDelete(i.id)} 
                        disabled={!can.delete}
                        className="inline-block bg-red-100 text-red-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedItems.length)} of {sortedItems.length} transactions
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