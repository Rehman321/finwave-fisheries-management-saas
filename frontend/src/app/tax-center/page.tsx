"use client";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface Tax { 
  id: number; 
  name: string; 
  rate: number; 
  type: string; 
  description: string;
}

type SortField = "name" | "rate" | "type";
type SortDirection = "asc" | "desc";

export default function TaxCenterPage() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Tax>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Search, Sort, Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/tax-center");
        const data = await res.json();
        setTaxes(data);
      } catch (e: any) {
        toast.error("Failed to load taxes");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!form.name?.trim()) {
      errors.name = "Tax name is required";
    }
    
    if (form.rate === undefined || isNaN(Number(form.rate)) || Number(form.rate) < 0) {
      errors.rate = "Valid tax rate is required";
    }
    
    if (!form.type?.trim()) {
      errors.type = "Tax type is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveTax = async () => {
    if (!validateForm()) {
      toast.error("Please fix form errors");
      return;
    }

    const payload: Tax = {
      id: editingId ?? Math.max(0, ...taxes.map(t => t.id)) + 1,
      name: String(form.name ?? "").trim(),
      rate: Number(form.rate ?? 0),
      type: String(form.type ?? "Output").trim(),
      description: String(form.description ?? "").trim(),
    };
    
    try {
      if (editingId) {
        setTaxes(prev => prev.map(t => t.id === editingId ? payload : t));
        await fetch("/api/tax-center", { 
          method: "PATCH", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload) 
        });
        toast.success("Tax updated successfully");
      } else {
        setTaxes(prev => [payload, ...prev]);
        await fetch("/api/tax-center", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload) 
        });
        toast.success("Tax created successfully");
      }
      
      setOpen(false);
      setEditingId(null);
      setForm({});
      setFormErrors({});
    } catch (e) {
      toast.error("Failed to save tax");
    }
  };

  const onEdit = (tax: Tax) => {
    setForm(tax);
    setEditingId(tax.id);
    setFormErrors({});
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this tax?")) return;
    try {
      setTaxes(prev => prev.filter(t => t.id !== id));
      await fetch(`/api/tax-center?id=${id}`, { method: "DELETE" });
      toast.success("Tax deleted successfully");
    } catch (e) {
      toast.error("Failed to delete tax");
    }
  };

  // Filtered and sorted data
  const filteredAndSortedTaxes = useMemo(() => {
    let filtered = taxes.filter(t => {
      const matchesSearch = !searchTerm || 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === "all" || t.type === typeFilter;
      
      return matchesSearch && matchesType;
    });

    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [taxes, searchTerm, typeFilter, sortField, sortDirection]);

  const paginatedTaxes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedTaxes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedTaxes, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedTaxes.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const outputTaxes = useMemo(() => taxes.filter(t => t.type === "Output"), [taxes]);
  const inputTaxes = useMemo(() => taxes.filter(t => t.type === "Input"), [taxes]);
  const avgRate = useMemo(() => {
    if (taxes.length === 0) return 0;
    return taxes.reduce((sum, t) => sum + t.rate, 0) / taxes.length;
  }, [taxes]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-lg text-[var(--color-muted-foreground)]">Loading taxes…</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Tax Center</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Manage tax rates, categories, and compliance</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button 
              onClick={() => { setEditingId(null); setForm({}); setFormErrors({}); }}
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-blue-200 transition"
            >
              New Tax
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Tax" : "Add Tax"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Tax Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  value={form.name ?? ""} 
                  onChange={(e) => setForm(f => ({...f, name: e.target.value}))}
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rate">Rate (%) <span className="text-red-500">*</span></Label>
                <Input 
                  id="rate" 
                  type="number" 
                  step="0.1" 
                  value={form.rate ?? ""} 
                  onChange={(e) => setForm(f => ({...f, rate: Number(e.target.value)}))}
                  className={formErrors.rate ? "border-red-500" : ""}
                />
                {formErrors.rate && <p className="text-xs text-red-500">{formErrors.rate}</p>}
              </div>
              <div className="grid gap-2">
                <Label>Type <span className="text-red-500">*</span></Label>
                <select 
                  value={form.type ?? "Output"} 
                  onChange={(e) => setForm(f => ({...f, type: e.target.value}))} 
                  className={`rounded-md border bg-background px-3 py-2 text-sm ${formErrors.type ? "border-red-500" : "border-[var(--color-border)]"}`}
                >
                  <option value="Output">Output (Sales Tax)</option>
                  <option value="Input">Input (Purchase Tax)</option>
                </select>
                {formErrors.type && <p className="text-xs text-red-500">{formErrors.type}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  value={form.description ?? ""} 
                  onChange={(e) => setForm(f => ({...f, description: e.target.value}))} 
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
                onClick={saveTax}
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
          <CardHeader><CardTitle>Total Taxes</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{taxes.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Output Taxes</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-[var(--chart-2)]">{outputTaxes.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Input Taxes</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-[var(--chart-1)]">{inputTaxes.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Average Rate</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{avgRate.toFixed(1)}%</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>Tax Configuration</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
                <Input
                  placeholder="Search taxes..."
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
                <option value="Output">Output</option>
                <option value="Input">Input</option>
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
                      onClick={() => handleSort("name")}
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Name <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      onClick={() => handleSort("rate")}
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Rate (%) <ArrowUpDown className="ml-2 h-3 w-3 inline" />
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
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTaxes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-[var(--color-muted-foreground)]">
                      {searchTerm || typeFilter !== "all" ? "No taxes found" : "No taxes yet"}
                    </TableCell>
                  </TableRow>
                )}
                {paginatedTaxes.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="font-semibold">{t.rate}%</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.type === "Output" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}>
                        {t.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-[var(--color-muted-foreground)]">{t.description || "—"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <button 
                        onClick={() => onEdit(t)}
                        className="inline-block bg-green-100 text-green-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-green-200 transition"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => onDelete(t.id)}
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedTaxes.length)} of {filteredAndSortedTaxes.length} taxes
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