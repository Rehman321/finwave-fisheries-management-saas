"use client";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, DollarSign, TrendingUp, Users, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface SalaryPayment {
  id: number;
  employeeId: number;
  employeeName: string;
  period: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentDate: string;
  paymentMethod: "bank_transfer" | "cash" | "cheque";
  status: "pending" | "paid" | "failed";
  transactionRef: string;
}

export default function SalaryPaymentsPage() {
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<SalaryPayment>>({
    paymentMethod: "bank_transfer",
    status: "pending",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Search, Sort, Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"paymentDate" | "employeeName" | "netSalary">("paymentDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const load = async () => {
      // Simulated data
      const dummyData: SalaryPayment[] = Array.from({ length: 30 }, (_, i) => {
        const statuses: SalaryPayment["status"][] = ["pending", "paid", "failed"];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const basicSalary = Math.floor(Math.random() * 5000) + 3000;
        const allowances = Math.floor(Math.random() * 1000);
        const deductions = Math.floor(Math.random() * 500);
        
        return {
          id: i + 1,
          employeeId: Math.floor(Math.random() * 20) + 1,
          employeeName: `Employee ${Math.floor(Math.random() * 20) + 1}`,
          period: `${new Date(2025, Math.floor(Math.random() * 3), 1).toLocaleDateString('default', { month: 'short', year: 'numeric' })}`,
          basicSalary,
          allowances,
          deductions,
          netSalary: basicSalary + allowances - deductions,
          paymentDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          paymentMethod: ["bank_transfer", "cash", "cheque"][Math.floor(Math.random() * 3)] as any,
          status,
          transactionRef: `TXN-${String(i + 1).padStart(6, "0")}`,
        };
      });
      setPayments(dummyData);
      setLoading(false);
    };
    load();
  }, []);

  const savePayment = async () => {
    if (!form.employeeName || !form.period || !form.basicSalary) {
      toast.error("Please fill in required fields");
      return;
    }

    const basicSalary = Number(form.basicSalary) || 0;
    const allowances = Number(form.allowances) || 0;
    const deductions = Number(form.deductions) || 0;
    const netSalary = basicSalary + allowances - deductions;

    const payload: SalaryPayment = {
      id: editingId ?? Math.max(0, ...payments.map(p => p.id)) + 1,
      employeeId: form.employeeId || 1,
      employeeName: form.employeeName,
      period: form.period,
      basicSalary,
      allowances,
      deductions,
      netSalary,
      paymentDate: form.paymentDate || new Date().toISOString().split("T")[0],
      paymentMethod: form.paymentMethod || "bank_transfer",
      status: form.status || "pending",
      transactionRef: form.transactionRef || `TXN-${String(payments.length + 1).padStart(6, "0")}`,
    };

    if (editingId) {
      setPayments(prev => prev.map(p => p.id === editingId ? payload : p));
      toast.success("Payment updated successfully");
    } else {
      setPayments(prev => [payload, ...prev]);
      toast.success("Payment created successfully");
    }

    setOpen(false);
    setEditingId(null);
    setForm({ paymentMethod: "bank_transfer", status: "pending" });
  };

  const onEdit = (payment: SalaryPayment) => {
    setForm(payment);
    setEditingId(payment.id);
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;
    setPayments(prev => prev.filter(p => p.id !== id));
    toast.success("Payment deleted successfully");
  };

  const updateStatus = async (id: number, status: SalaryPayment["status"]) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    toast.success("Status updated successfully");
  };

  // Filtered and sorted data
  const filteredAndSortedPayments = useMemo(() => {
    let filtered = payments.filter(p => {
      const matchesSearch = !searchTerm || 
        p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.transactionRef.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      
      if (sortField === "paymentDate") {
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
  }, [payments, searchTerm, statusFilter, sortField, sortDirection]);

  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedPayments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedPayments, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedPayments.length / itemsPerPage);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const stats = useMemo(() => {
    const totalPaid = payments
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + p.netSalary, 0);
    const totalPending = payments
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + p.netSalary, 0);
    const paidCount = payments.filter(p => p.status === "paid").length;
    const uniqueEmployees = new Set(payments.map(p => p.employeeId)).size;
    
    return { totalPaid, totalPending, paidCount, uniqueEmployees };
  }, [payments]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-lg text-[var(--color-muted-foreground)]">Loading salary payments…</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Salary Payments</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Process and track employee salary disbursements</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button 
              onClick={() => { setEditingId(null); setForm({ paymentMethod: "bank_transfer", status: "pending" }); }}
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-blue-200 transition"
            >
              New Payment
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Payment" : "Create Payment"}</DialogTitle>
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
              <div className="grid gap-2">
                <Label>Period <span className="text-red-500">*</span></Label>
                <Input 
                  placeholder="e.g., Jan 2025" 
                  value={form.period ?? ""} 
                  onChange={(e) => setForm(f => ({ ...f, period: e.target.value }))} 
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Basic Salary <span className="text-red-500">*</span></Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={form.basicSalary ?? ""} 
                    onChange={(e) => setForm(f => ({ ...f, basicSalary: parseFloat(e.target.value) || 0 }))} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Allowances</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={form.allowances ?? 0} 
                    onChange={(e) => setForm(f => ({ ...f, allowances: parseFloat(e.target.value) || 0 }))} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Deductions</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={form.deductions ?? 0} 
                    onChange={(e) => setForm(f => ({ ...f, deductions: parseFloat(e.target.value) || 0 }))} 
                  />
                </div>
              </div>
              <div className="p-3 bg-[var(--color-muted)] rounded-lg">
                <p className="text-sm font-medium">Net Salary: ${((Number(form.basicSalary) || 0) + (Number(form.allowances) || 0) - (Number(form.deductions) || 0)).toFixed(2)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Payment Date</Label>
                  <Input 
                    type="date" 
                    value={form.paymentDate ?? ""} 
                    onChange={(e) => setForm(f => ({ ...f, paymentDate: e.target.value }))} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Payment Method</Label>
                  <select 
                    value={form.paymentMethod ?? "bank_transfer"} 
                    onChange={(e) => setForm(f => ({ ...f, paymentMethod: e.target.value as any }))}
                    className="rounded-md border border-[var(--color-border)] bg-background px-3 py-2 text-sm"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <select 
                  value={form.status ?? "pending"} 
                  onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))}
                  className="rounded-md border border-[var(--color-border)] bg-background px-3 py-2 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
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
                onClick={savePayment}
                className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-indigo-200 transition"
              >
                {editingId ? "Save Changes" : "Create Payment"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">${stats.totalPaid.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold text-orange-600">${stats.totalPending.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Count</CardTitle>
            <CheckCircle className="h-4 w-4 text-[var(--chart-2)]" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.paidCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
            <Users className="h-4 w-4 text-[var(--chart-3)]" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.uniqueEmployees}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>Payment Records</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
                <Input
                  placeholder="Search payments..."
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
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
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
                  <TableHead>Period</TableHead>
                  <TableHead>Basic</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>
                    <button 
                      onClick={() => handleSort("netSalary")}
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Net Salary <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      onClick={() => handleSort("paymentDate")}
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Date <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-[var(--color-muted-foreground)]">
                      No payments found
                    </TableCell>
                  </TableRow>
                )}
                {paginatedPayments.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.employeeName}</TableCell>
                    <TableCell>{p.period}</TableCell>
                    <TableCell>${p.basicSalary.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600">+${p.allowances.toLocaleString()}</TableCell>
                    <TableCell className="text-red-600">-${p.deductions.toLocaleString()}</TableCell>
                    <TableCell className="font-bold">${p.netSalary.toLocaleString()}</TableCell>
                    <TableCell>{new Date(p.paymentDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <select
                        value={p.status}
                        onChange={(e) => updateStatus(p.id, e.target.value as SalaryPayment["status"])}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 capitalize ${
                          p.status === "paid" ? "bg-green-100 text-green-800" :
                          p.status === "failed" ? "bg-red-100 text-red-800" :
                          "bg-orange-100 text-orange-800"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedPayments.length)} of {filteredAndSortedPayments.length} payments
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