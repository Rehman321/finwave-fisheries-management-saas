"use client";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface Customer { 
  id: number; 
  name: string; 
  email: string; 
  phone: string; 
  address?: string;
  outstandingBalance: number;
}

type SortField = "name" | "email" | "phone" | "outstandingBalance";
type SortDirection = "asc" | "desc";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Customer>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Search, Sort, Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/customers");
        const data = await res.json();
        setCustomers(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load customers");
        toast.error("Failed to load customers");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!form.name?.trim()) {
      errors.name = "Name is required";
    }
    
    if (!form.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Invalid email format";
    }
    
    if (!form.phone?.trim()) {
      errors.phone = "Phone is required";
    }
    
    if (form.outstandingBalance !== undefined && isNaN(Number(form.outstandingBalance))) {
      errors.outstandingBalance = "Outstanding balance must be a number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveCustomer = async () => {
    if (!validateForm()) {
      toast.error("Please fix form errors");
      return;
    }
    
    const payload: Customer = {
      id: editingId ?? Math.max(0, ...customers.map(c => c.id)) + 1,
      name: String(form.name ?? "").trim(),
      email: String(form.email ?? "").trim(),
      phone: String(form.phone ?? "").trim(),
      address: String(form.address ?? "").trim(),
      outstandingBalance: Number(form.outstandingBalance ?? 0),
    };
    
    try {
      if (editingId) {
        setCustomers(prev => prev.map(c => c.id === editingId ? payload : c));
        await fetch("/api/customers", { 
          method: "PATCH", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload) 
        });
        toast.success("Customer updated successfully");
      } else {
        setCustomers(prev => [payload, ...prev]);
        await fetch("/api/customers", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload) 
        });
        toast.success("Customer created successfully");
      }
      
      setOpen(false);
      setEditingId(null);
      setForm({});
      setFormErrors({});
    } catch (e) {
      toast.error("Failed to save customer");
    }
  };

  const onEdit = (customer: Customer) => {
    setForm(customer);
    setEditingId(customer.id);
    setFormErrors({});
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      setCustomers(prev => prev.filter(c => c.id !== id));
      await fetch(`/api/customers?id=${id}`, { method: "DELETE" });
      toast.success("Customer deleted successfully");
    } catch (e) {
      toast.error("Failed to delete customer");
    }
  };

  // Filtered and sorted data
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
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
  }, [customers, searchTerm, sortField, sortDirection]);

  // Paginated data
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedCustomers, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedCustomers.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const totalOutstanding = useMemo(() => 
    customers.reduce((sum, c) => sum + c.outstandingBalance, 0), 
    [customers]
  );

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-lg text-[var(--color-muted-foreground)]">Loading customers…</div>
    </div>
  );
  
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Customers</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Manage customer information and relationships</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); setForm({}); setFormErrors({}); }}>New Customer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Customer" : "Add Customer"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  value={form.name ?? ""} 
                  onChange={(e) => setForm(f => ({...f, name: e.target.value}))}
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={form.email ?? ""} 
                  onChange={(e) => setForm(f => ({...f, email: e.target.value}))}
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                <Input 
                  id="phone" 
                  value={form.phone ?? ""} 
                  onChange={(e) => setForm(f => ({...f, phone: e.target.value}))}
                  className={formErrors.phone ? "border-red-500" : ""}
                />
                {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  value={form.address ?? ""} 
                  onChange={(e) => setForm(f => ({...f, address: e.target.value}))} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="balance">Outstanding Balance</Label>
                <Input 
                  id="balance" 
                  type="number" 
                  step="0.01"
                  value={form.outstandingBalance ?? 0} 
                  onChange={(e) => setForm(f => ({...f, outstandingBalance: parseFloat(e.target.value) || 0}))}
                  className={formErrors.outstandingBalance ? "border-red-500" : ""}
                />
                {formErrors.outstandingBalance && <p className="text-xs text-red-500">{formErrors.outstandingBalance}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={saveCustomer}>{editingId ? "Save Changes" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total Customers</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{customers.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Outstanding</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-[var(--chart-1)]">${totalOutstanding.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Avg Balance</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">
            ${customers.length > 0 ? (totalOutstanding / customers.length).toFixed(2) : "0.00"}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>Customer Directory</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("name")} className="h-8 px-2">
                      Name <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("email")} className="h-8 px-2">
                      Email <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("phone")} className="h-8 px-2">
                      Phone <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort("outstandingBalance")} className="h-8 px-2">
                      Outstanding Balance <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-[var(--color-muted-foreground)]">
                      {searchTerm ? "No customers found" : "No customers yet"}
                    </TableCell>
                  </TableRow>
                )}
                {paginatedCustomers.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.phone}</TableCell>
                    <TableCell>
                      <span className={c.outstandingBalance > 0 ? "text-[var(--chart-1)] font-semibold" : ""}>
                        ${c.outstandingBalance.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => onEdit(c)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(c.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedCustomers.length)} of {filteredAndSortedCustomers.length} customers
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