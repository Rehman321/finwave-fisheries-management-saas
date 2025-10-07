"use client";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Calendar, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface PayrollPeriod {
  id: number;
  periodName: string;
  startDate: string;
  endDate: string;
  payDate: string;
  status: "draft" | "processing" | "paid" | "closed";
  totalEmployees: number;
  totalAmount: number;
  notes: string;
}

export default function PayrollPeriodsPage() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<PayrollPeriod>>({
    status: "draft",
    totalEmployees: 0,
    totalAmount: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Search, Sort, Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"startDate" | "periodName" | "totalAmount">("startDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const load = async () => {
      // Simulated data
      const dummyData: PayrollPeriod[] = Array.from({ length: 12 }, (_, i) => {
        const statuses: PayrollPeriod["status"][] = ["draft", "processing", "paid", "closed"];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const startDate = new Date(2025, i, 1);
        const endDate = new Date(2025, i + 1, 0);
        const payDate = new Date(2025, i + 1, 5);
        
        return {
          id: i + 1,
          periodName: `${startDate.toLocaleString('default', { month: 'long' })} 2025`,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          payDate: payDate.toISOString().split("T")[0],
          status,
          totalEmployees: Math.floor(Math.random() * 50) + 10,
          totalAmount: Math.floor(Math.random() * 100000) + 50000,
          notes: status === "processing" ? "In progress" : "",
        };
      });
      setPeriods(dummyData);
      setLoading(false);
    };
    load();
  }, []);

  const savePeriod = async () => {
    if (!form.periodName || !form.startDate || !form.endDate || !form.payDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload: PayrollPeriod = {
      id: editingId ?? Math.max(0, ...periods.map(p => p.id)) + 1,
      periodName: form.periodName,
      startDate: form.startDate,
      endDate: form.endDate,
      payDate: form.payDate,
      status: form.status || "draft",
      totalEmployees: form.totalEmployees || 0,
      totalAmount: form.totalAmount || 0,
      notes: form.notes || "",
    };

    if (editingId) {
      setPeriods(prev => prev.map(p => p.id === editingId ? payload : p));
      toast.success("Period updated successfully");
    } else {
      setPeriods(prev => [payload, ...prev]);
      toast.success("Period created successfully");
    }

    setOpen(false);
    setEditingId(null);
    setForm({ status: "draft", totalEmployees: 0, totalAmount: 0 });
  };

  const onEdit = (period: PayrollPeriod) => {
    setForm(period);
    setEditingId(period.id);
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this period?")) return;
    setPeriods(prev => prev.filter(p => p.id !== id));
    toast.success("Period deleted successfully");
  };

  const updateStatus = async (id: number, status: PayrollPeriod["status"]) => {
    setPeriods(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    toast.success("Status updated successfully");
  };

  // Filtered and sorted data
  const filteredAndSortedPeriods = useMemo(() => {
    let filtered = periods.filter(p => {
      const matchesSearch = !searchTerm || 
        p.periodName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      
      if (sortField === "startDate") {
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
  }, [periods, searchTerm, statusFilter, sortField, sortDirection]);

  const paginatedPeriods = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedPeriods.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedPeriods, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedPeriods.length / itemsPerPage);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const stats = useMemo(() => {
    const draft = periods.filter(p => p.status === "draft").length;
    const processing = periods.filter(p => p.status === "processing").length;
    const paid = periods.filter(p => p.status === "paid").length;
    const totalPaid = periods
      .filter(p => p.status === "paid" || p.status === "closed")
      .reduce((sum, p) => sum + p.totalAmount, 0);
    
    return { draft, processing, paid, totalPaid };
  }, [periods]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-lg text-[var(--color-muted-foreground)]">Loading payroll periods…</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Payroll Periods</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Manage payroll cycles and payment schedules</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button 
              onClick={() => { setEditingId(null); setForm({ status: "draft", totalEmployees: 0, totalAmount: 0 }); }}
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-blue-200 transition"
            >
              New Period
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Period" : "Create Period"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Period Name <span className="text-red-500">*</span></Label>
                <Input 
                  placeholder="e.g., January 2025" 
                  value={form.periodName ?? ""} 
                  onChange={(e) => setForm(f => ({ ...f, periodName: e.target.value }))} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Start Date <span className="text-red-500">*</span></Label>
                  <Input 
                    type="date" 
                    value={form.startDate ?? ""} 
                    onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>End Date <span className="text-red-500">*</span></Label>
                  <Input 
                    type="date" 
                    value={form.endDate ?? ""} 
                    onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))} 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Pay Date <span className="text-red-500">*</span></Label>
                <Input 
                  type="date" 
                  value={form.payDate ?? ""} 
                  onChange={(e) => setForm(f => ({ ...f, payDate: e.target.value }))} 
                />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <select 
                  value={form.status ?? "draft"} 
                  onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))}
                  className="rounded-md border border-[var(--color-border)] bg-background px-3 py-2 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="processing">Processing</option>
                  <option value="paid">Paid</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Notes</Label>
                <Input 
                  placeholder="Additional notes" 
                  value={form.notes ?? ""} 
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} 
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
                onClick={savePeriod}
                className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-indigo-200 transition"
              >
                {editingId ? "Save Changes" : "Create Period"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Calendar className="h-4 w-4 text-[var(--color-muted-foreground)]" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.draft}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold text-orange-600">{stats.processing}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">{stats.paid}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-[var(--chart-2)]">${stats.totalPaid.toLocaleString()}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>Payroll Periods</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
                <Input
                  placeholder="Search periods..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-md border border-[var(--color-border)] bg-background px-3 py-2 text-sm w-full sm:w-32"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="processing">Processing</option>
                <option value="paid">Paid</option>
                <option value="closed">Closed</option>
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
                      onClick={() => handleSort("periodName")}
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Period <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      onClick={() => handleSort("startDate")}
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Start Date <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Pay Date</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>
                    <button 
                      onClick={() => handleSort("totalAmount")}
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Amount <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPeriods.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-[var(--color-muted-foreground)]">
                      No periods found
                    </TableCell>
                  </TableRow>
                )}
                {paginatedPeriods.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.periodName}</TableCell>
                    <TableCell>{new Date(p.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(p.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(p.payDate).toLocaleDateString()}</TableCell>
                    <TableCell>{p.totalEmployees}</TableCell>
                    <TableCell className="font-semibold">${p.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <select
                        value={p.status}
                        onChange={(e) => updateStatus(p.id, e.target.value as PayrollPeriod["status"])}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 capitalize ${
                          p.status === "paid" || p.status === "closed" ? "bg-green-100 text-green-800" :
                          p.status === "processing" ? "bg-orange-100 text-orange-800" :
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <option value="draft">Draft</option>
                        <option value="processing">Processing</option>
                        <option value="paid">Paid</option>
                        <option value="closed">Closed</option>
                      </select>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <button 
                        onClick={() => onEdit(p)}
                        className="inline-block bg-green-100 text-green-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-green-200 transition"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => onDelete(p.id)}
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedPeriods.length)} of {filteredAndSortedPeriods.length} periods
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