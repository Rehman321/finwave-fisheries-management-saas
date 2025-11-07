"use client";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface Supplier {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  balance: number;
}

type SortField = "companyName" | "contactPerson" | "email" | "phone" | "balance";
type SortDirection = "asc" | "desc";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Supplier>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Search, Sort, Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("companyName");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/suppliers");
        const data = await res.json();
        setSuppliers(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load suppliers");
        toast.error("Failed to load suppliers");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.companyName?.trim()) {
      errors.companyName = "Company name is required";
    }

    if (!form.contactPerson?.trim()) {
      errors.contactPerson = "Contact person is required";
    }

    if (!form.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Invalid email format";
    }

    if (!form.phone?.trim()) {
      errors.phone = "Phone is required";
    }

    if (form.balance !== undefined && isNaN(Number(form.balance))) {
      errors.balance = "Balance must be a number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveSupplier = async () => {
    if (!validateForm()) {
      toast.error("Please fix form errors");
      return;
    }

    const payload: Supplier = {
      id: editingId ?? Math.max(0, ...suppliers.map((s) => s.id)) + 1,
      companyName: String(form.companyName ?? "").trim(),
      contactPerson: String(form.contactPerson ?? "").trim(),
      email: String(form.email ?? "").trim(),
      phone: String(form.phone ?? "").trim(),
      address: String(form.address ?? "").trim(),
      balance: Number(form.balance ?? 0)
    };

    try {
      if (editingId) {
        setSuppliers((prev) => prev.map((s) => s.id === editingId ? payload : s));
        await fetch("/api/suppliers", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        toast.success("Supplier updated successfully");
      } else {
        setSuppliers((prev) => [payload, ...prev]);
        await fetch("/api/suppliers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        toast.success("Supplier created successfully");
      }

      setOpen(false);
      setEditingId(null);
      setForm({});
      setFormErrors({});
    } catch (e) {
      toast.error("Failed to save supplier");
    }
  };

  const onEdit = (supplier: Supplier) => {
    setForm(supplier);
    setEditingId(supplier.id);
    setFormErrors({});
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    try {
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      await fetch(`/api/suppliers?id=${id}`, { method: "DELETE" });
      toast.success("Supplier deleted successfully");
    } catch (e) {
      toast.error("Failed to delete supplier");
    }
  };

  // Filtered and sorted data
  const filteredAndSortedSuppliers = useMemo(() => {
    let filtered = suppliers.filter((s) =>
    s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
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
  }, [suppliers, searchTerm, sortField, sortDirection]);

  // Paginated data
  const paginatedSuppliers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedSuppliers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedSuppliers, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedSuppliers.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const totalBalance = useMemo(() =>
  suppliers.reduce((sum, s) => sum + s.balance, 0),
  [suppliers]
  );

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-lg text-[var(--color-muted-foreground)]">Loading suppliers…</div>
    </div>);


  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Suppliers</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Manage supplier information and relationships</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button 
              onClick={() => {setEditingId(null);setForm({});setFormErrors({});}}
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-blue-200 transition"
            >
              New Supplier
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
                <Input
                  id="companyName"
                  value={form.companyName ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                  className={formErrors.companyName ? "border-red-500" : ""} />
                {formErrors.companyName && <p className="text-xs text-red-500">{formErrors.companyName}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPerson">Contact Person <span className="text-red-500">*</span></Label>
                <Input
                  id="contactPerson"
                  value={form.contactPerson ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))}
                  className={formErrors.contactPerson ? "border-red-500" : ""} />
                {formErrors.contactPerson && <p className="text-xs text-red-500">{formErrors.contactPerson}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={formErrors.email ? "border-red-500" : ""} />
                {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                <Input
                  id="phone"
                  value={form.phone ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className={formErrors.phone ? "border-red-500" : ""} />
                {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.address ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="balance">Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={form.balance ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, balance: parseFloat(e.target.value) || 0 }))}
                  className={formErrors.balance ? "border-red-500" : ""} />
                {formErrors.balance && <p className="text-xs text-red-500">{formErrors.balance}</p>}
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
                onClick={saveSupplier}
                className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-indigo-200 transition"
              >
                {editingId ? "Save Changes" : "Create"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total Suppliers</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{suppliers.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Payable</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-[var(--chart-1)]">${totalBalance.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Avg Balance</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">
            ${suppliers.length > 0 ? (totalBalance / suppliers.length).toFixed(2) : "0.00"}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>Supplier Directory</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
              <Input
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8" />
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
                      onClick={() => handleSort("companyName")} 
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Company Name <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      onClick={() => handleSort("contactPerson")} 
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Contact Person <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      onClick={() => handleSort("phone")} 
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Phone <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      onClick={() => handleSort("balance")} 
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Balance <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSuppliers.length === 0 &&
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-[var(--color-muted-foreground)]">
                      {searchTerm ? "No suppliers found" : "No suppliers yet"}
                    </TableCell>
                  </TableRow>
                }
                {paginatedSuppliers.map((s) =>
                <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.companyName}</TableCell>
                    <TableCell>{s.contactPerson}</TableCell>
                    <TableCell>{s.phone}</TableCell>
                    <TableCell>
                      <span className={s.balance > 0 ? "text-[var(--chart-1)] font-semibold" : ""}>
                        ${s.balance.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <button 
                        onClick={() => onEdit(s)}
                        className="inline-block bg-green-100 text-green-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-green-200 transition"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => onDelete(s.id)}
                        className="inline-block bg-red-100 text-red-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-red-200 transition"
                      >
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 &&
          <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedSuppliers.length)} of {filteredAndSortedSuppliers.length} suppliers
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded border border-input bg-background hover:bg-accent hover:text-accent-foreground transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded border border-input bg-background hover:bg-accent hover:text-accent-foreground transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          }
        </CardContent>
      </Card>
    </div>);
}