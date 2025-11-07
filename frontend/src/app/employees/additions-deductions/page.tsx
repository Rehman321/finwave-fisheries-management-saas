"use client";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Plus, Minus, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface AdditionDeduction {
  id: number;
  employeeId: number;
  employeeName: string;
  type: "addition" | "deduction";
  category: string;
  amount: number;
  description: string;
  effectiveFrom: string;
  effectiveTo: string;
  isRecurring: boolean;
  status: "active" | "inactive" | "expired";
}

const ADDITION_CATEGORIES = ["Bonus", "Overtime", "Commission", "Allowance", "Incentive", "Other"];
const DEDUCTION_CATEGORIES = ["Tax", "Loan", "Advance", "Insurance", "Fine", "Other"];

export default function AdditionsDeductionsPage() {
  const [items, setItems] = useState<AdditionDeduction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<AdditionDeduction>>({
    type: "addition",
    isRecurring: false,
    status: "active",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Search, Sort, Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"employeeName" | "amount" | "effectiveFrom">("effectiveFrom");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const load = async () => {
      // Simulated data
      const dummyData: AdditionDeduction[] = Array.from({ length: 25 }, (_, i) => {
        const types: AdditionDeduction["type"][] = ["addition", "deduction"];
        const type = types[Math.floor(Math.random() * types.length)];
        const categories = type === "addition" ? ADDITION_CATEGORIES : DEDUCTION_CATEGORIES;
        const category = categories[Math.floor(Math.random() * categories.length)];
        
        return {
          id: i + 1,
          employeeId: Math.floor(Math.random() * 20) + 1,
          employeeName: `Employee ${Math.floor(Math.random() * 20) + 1}`,
          type,
          category,
          amount: Math.floor(Math.random() * 2000) + 100,
          description: `${category} for employee`,
          effectiveFrom: new Date(2025, Math.floor(Math.random() * 3), 1).toISOString().split("T")[0],
          effectiveTo: Math.random() > 0.5 ? new Date(2025, Math.floor(Math.random() * 6) + 6, 1).toISOString().split("T")[0] : "",
          isRecurring: Math.random() > 0.5,
          status: ["active", "inactive", "expired"][Math.floor(Math.random() * 3)] as any,
        };
      });
      setItems(dummyData);
      setLoading(false);
    };
    load();
  }, []);

  const saveItem = async () => {
    if (!form.employeeName || !form.category || !form.amount || !form.effectiveFrom) {
      toast.error("Please fill in required fields");
      return;
    }

    const payload: AdditionDeduction = {
      id: editingId ?? Math.max(0, ...items.map(i => i.id)) + 1,
      employeeId: form.employeeId || 1,
      employeeName: form.employeeName,
      type: form.type || "addition",
      category: form.category,
      amount: Number(form.amount) || 0,
      description: form.description || "",
      effectiveFrom: form.effectiveFrom,
      effectiveTo: form.effectiveTo || "",
      isRecurring: form.isRecurring || false,
      status: form.status || "active",
    };

    if (editingId) {
      setItems(prev => prev.map(i => i.id === editingId ? payload : i));
      toast.success("Record updated successfully");
    } else {
      setItems(prev => [payload, ...prev]);
      toast.success("Record created successfully");
    }

    setOpen(false);
    setEditingId(null);
    setForm({ type: "addition", isRecurring: false, status: "active" });
  };

  const onEdit = (item: AdditionDeduction) => {
    setForm(item);
    setEditingId(item.id);
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success("Record deleted successfully");
  };

  // Filtered and sorted data
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter(i => {
      const matchesSearch = !searchTerm || 
        i.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === "all" || i.type === typeFilter;
      const matchesStatus = statusFilter === "all" || i.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      
      if (sortField === "effectiveFrom") {
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
  }, [items, searchTerm, typeFilter, statusFilter, sortField, sortDirection]);

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

  const stats = useMemo(() => {
    const totalAdditions = items
      .filter(i => i.type === "addition" && i.status === "active")
      .reduce((sum, i) => sum + i.amount, 0);
    const totalDeductions = items
      .filter(i => i.type === "deduction" && i.status === "active")
      .reduce((sum, i) => sum + i.amount, 0);
    const activeCount = items.filter(i => i.status === "active").length;
    const recurringCount = items.filter(i => i.isRecurring && i.status === "active").length;
    
    return { totalAdditions, totalDeductions, activeCount, recurringCount };
  }, [items]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-lg text-[var(--color-muted-foreground)]">Loading records…</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Additions & Deductions</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Manage salary additions and deductions for employees</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button 
              onClick={() => { setEditingId(null); setForm({ type: "addition", isRecurring: false, status: "active" }); }}
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-blue-200 transition"
            >
              New Entry
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Entry" : "Create Entry"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Employee Name <span className="text-red-500">*</span></Label>
                <Input 
                  placeholder="Employee name" 
                  value={form.employeeName ?? ""} 
                  onChange={(e) => setForm(f => ({ ...f, employeeName: e.target.value }))} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Type <span className="text-red-500">*</span></Label>
                  <select 
                    value={form.type ?? "addition"} 
                    onChange={(e) => setForm(f => ({ ...f, type: e.target.value as any, category: "" }))}
                    className="rounded-md border border-[var(--color-border)] bg-background px-3 py-2 text-sm"
                  >
                    <option value="addition">Addition</option>
                    <option value="deduction">Deduction</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Category <span className="text-red-500">*</span></Label>
                  <select 
                    value={form.category ?? ""} 
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                    className="rounded-md border border-[var(--color-border)] bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select category</option>
                    {(form.type === "addition" ? ADDITION_CATEGORIES : DEDUCTION_CATEGORIES).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Amount <span className="text-red-500">*</span></Label>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00" 
                  value={form.amount ?? ""} 
                  onChange={(e) => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} 
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Input 
                  placeholder="Brief description" 
                  value={form.description ?? ""} 
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Effective From <span className="text-red-500">*</span></Label>
                  <Input 
                    type="date" 
                    value={form.effectiveFrom ?? ""} 
                    onChange={(e) => setForm(f => ({ ...f, effectiveFrom: e.target.value }))} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Effective To</Label>
                  <Input 
                    type="date" 
                    value={form.effectiveTo ?? ""} 
                    onChange={(e) => setForm(f => ({ ...f, effectiveTo: e.target.value }))} 
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isRecurring"
                  checked={form.isRecurring ?? false}
                  onChange={(e) => setForm(f => ({ ...f, isRecurring: e.target.checked }))}
                  className="h-4 w-4"
                />
                <Label htmlFor="isRecurring" className="cursor-pointer">Recurring (applies every payroll)</Label>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <select 
                  value={form.status ?? "active"} 
                  onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))}
                  className="rounded-md border border-[var(--color-border)] bg-background px-3 py-2 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
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
                {editingId ? "Save Changes" : "Create Entry"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Additions</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">${stats.totalAdditions.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">${stats.totalDeductions.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Entries</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.activeCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recurring</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-[var(--chart-3)]">{stats.recurringCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>Salary Adjustments</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-md border border-[var(--color-border)] bg-background px-3 py-2 text-sm w-full sm:w-32"
              >
                <option value="all">All Types</option>
                <option value="addition">Addition</option>
                <option value="deduction">Deduction</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-md border border-[var(--color-border)] bg-background px-3 py-2 text-sm w-full sm:w-32"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button 
                      onClick={() => handleSort("employeeName")}
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Employee <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>
                    <button 
                      onClick={() => handleSort("amount")}
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Amount <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      onClick={() => handleSort("effectiveFrom")}
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Effective From <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>Recurring</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-[var(--color-muted-foreground)]">
                      No entries found
                    </TableCell>
                  </TableRow>
                )}
                {paginatedItems.map(i => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.employeeName}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        i.type === "addition" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {i.type === "addition" ? <Plus className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                        {i.type}
                      </span>
                    </TableCell>
                    <TableCell>{i.category}</TableCell>
                    <TableCell className={`font-semibold ${
                      i.type === "addition" ? "text-green-600" : "text-red-600"
                    }`}>
                      {i.type === "addition" ? "+" : "-"}${i.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{new Date(i.effectiveFrom).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {i.isRecurring && (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-[var(--chart-3)] bg-opacity-10 text-[var(--chart-3)]">
                          Yes
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        i.status === "active" ? "bg-green-100 text-green-800" :
                        i.status === "expired" ? "bg-gray-100 text-gray-800" :
                        "bg-orange-100 text-orange-800"
                      }`}>
                        {i.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <button 
                        onClick={() => onEdit(i)}
                        className="inline-block bg-green-100 text-green-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-green-200 transition"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => onDelete(i.id)}
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} entries
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