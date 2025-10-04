"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { toast } from "sonner";

interface ExpenseItem {
  id: number;
  ref: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

const EXPENSE_CATEGORIES = ["General", "Utilities", "Rent", "Salaries", "Equipment", "Transportation", "Marketing", "Supplies", "Maintenance", "Other"];

export default function ExpensesPage() {
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ref: "", category: "", description: "", amount: "", date: new Date().toISOString().split("T")[0] });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filters, Search, Sort, Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortField, setSortField] = useState<"date" | "amount" | "category">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/expenses");
        const data = await res.json();
        setItems(data);
      } catch (e: any) {
        toast.error("Failed to load expenses");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!form.category?.trim()) {
      errors.category = "Category is required";
    }
    
    if (!form.description?.trim()) {
      errors.description = "Description is required";
    }
    
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      errors.amount = "Amount must be a positive number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveExpense = async () => {
    if (!validateForm()) {
      toast.error("Please fix form errors");
      return;
    }
    
    const payload: ExpenseItem = {
      id: editingId ?? Math.max(0, ...items.map(i => i.id)) + 1,
      ref: form.ref || `EXP-${Math.floor(Math.random() * 9999).toString().padStart(4, "0")}`,
      category: form.category,
      description: form.description,
      amount: Number(form.amount),
      date: form.date || new Date().toISOString().split("T")[0],
    };

    try {
      if (editingId) {
        setItems(prev => prev.map(i => i.id === editingId ? payload : i));
        await fetch("/api/expenses", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        toast.success("Expense updated successfully");
      } else {
        setItems(prev => [payload, ...prev]);
        await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        toast.success("Expense added successfully");
      }

      setOpen(false);
      setEditingId(null);
      setForm({ ref: "", category: "", description: "", amount: "", date: new Date().toISOString().split("T")[0] });
      setFormErrors({});
    } catch (e) {
      toast.error("Failed to save expense");
    }
  };

  const onEdit = (item: ExpenseItem) => {
    setForm({ 
      ref: item.ref, 
      category: item.category, 
      description: item.description, 
      amount: String(item.amount),
      date: item.date.split("T")[0]
    });
    setEditingId(item.id);
    setFormErrors({});
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      setItems(prev => prev.filter(i => i.id !== id));
      await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
      toast.success("Expense deleted successfully");
    } catch (e) {
      toast.error("Failed to delete expense");
    }
  };

  // Filtered and sorted data
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter(item => {
      // Search filter
      const matchesSearch = !searchTerm || 
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      
      // Date range filter
      const itemDate = new Date(item.date);
      const matchesStartDate = !startDate || itemDate >= new Date(startDate);
      const matchesEndDate = !endDate || itemDate <= new Date(endDate);
      
      return matchesSearch && matchesCategory && matchesStartDate && matchesEndDate;
    });

    // Sort
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
  }, [items, searchTerm, categoryFilter, startDate, endDate, sortField, sortDirection]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedItems, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const total = useMemo(() => filteredAndSortedItems.reduce((s, i) => s + i.amount, 0), [filteredAndSortedItems]);
  const categorySummary = useMemo(() => {
    const summary: Record<string, number> = {};
    filteredAndSortedItems.forEach(item => {
      summary[item.category] = (summary[item.category] || 0) + item.amount;
    });
    return Object.entries(summary).sort((a, b) => b[1] - a[1]);
  }, [filteredAndSortedItems]);

  const hasActiveFilters = searchTerm || categoryFilter !== "all" || startDate || endDate;

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-lg text-[var(--color-muted-foreground)]">Loading expenses…</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Expenses</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Track and manage business expenses</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button 
              onClick={() => { 
                setEditingId(null); 
                setForm({ ref: "", category: "", description: "", amount: "", date: new Date().toISOString().split("T")[0] });
                setFormErrors({});
              }}
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-blue-200 transition"
            >
              Add Expense
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Expense" : "Add Expense"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="ref">Reference</Label>
                <Input 
                  id="ref" 
                  placeholder="Auto-generated if empty" 
                  value={form.ref} 
                  onChange={(e) => setForm(f => ({ ...f, ref: e.target.value }))} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                <Select 
                  value={form.category} 
                  onValueChange={(val) => setForm(f => ({ ...f, category: val }))}
                >
                  <SelectTrigger className={formErrors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category && <p className="text-xs text-red-500">{formErrors.category}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                <Input 
                  id="description" 
                  placeholder="Expense description" 
                  value={form.description} 
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  className={formErrors.description ? "border-red-500" : ""}
                />
                {formErrors.description && <p className="text-xs text-red-500">{formErrors.description}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount <span className="text-red-500">*</span></Label>
                <Input 
                  id="amount" 
                  type="number" 
                  step="0.01"
                  placeholder="0.00" 
                  value={form.amount} 
                  onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                  className={formErrors.amount ? "border-red-500" : ""}
                />
                {formErrors.amount && <p className="text-xs text-red-500">{formErrors.amount}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={form.date} 
                  onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                />
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
                onClick={saveExpense}
                className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-indigo-200 transition"
              >
                {editingId ? "Save Changes" : "Add Expense"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total Expenses</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-[var(--chart-1)]">${total.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Transactions</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{filteredAndSortedItems.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top Category</CardTitle></CardHeader>
          <CardContent>
            {categorySummary.length > 0 ? (
              <div>
                <div className="text-2xl font-bold">{categorySummary[0][0]}</div>
                <div className="text-sm text-[var(--color-muted-foreground)]">${categorySummary[0][1].toFixed(2)}</div>
              </div>
            ) : (
              <div className="text-sm text-[var(--color-muted-foreground)]">No expenses</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <CardTitle className="text-base">Filters</CardTitle>
            </div>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="inline-block bg-gray-100 text-gray-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-gray-200 transition"
              >
                Clear All
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={(val) => { setCategoryFilter(val); setCurrentPage(1); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {EXPENSE_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              />
            </div>
            
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("date")} className="h-8 px-2">
                      Date <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Ref</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("category")} className="h-8 px-2">
                      Category <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("amount")} className="h-8 px-2">
                      Amount <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-[var(--color-muted-foreground)]">
                      {hasActiveFilters ? "No expenses match your filters" : "No expenses yet"}
                    </TableCell>
                  </TableRow>
                )}
                {paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-mono text-xs">{item.ref}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-[var(--color-muted)] text-[var(--color-foreground)]">
                        {item.category}
                      </span>
                    </TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="font-semibold text-[var(--chart-1)]">${item.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <button 
                        onClick={() => onEdit(item)}
                        className="inline-block bg-green-100 text-green-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-green-200 transition"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => onDelete(item.id)}
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} expenses
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