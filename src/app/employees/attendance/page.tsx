"use client";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: "present" | "absent" | "late" | "half_day";
  hoursWorked: number;
  notes: string;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<AttendanceRecord>>({
    date: new Date().toISOString().split("T")[0],
    status: "present",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Search, Sort, Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [sortField, setSortField] = useState<"date" | "employeeName" | "hoursWorked">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const load = async () => {
      // Simulated data
      const dummyData: AttendanceRecord[] = Array.from({ length: 25 }, (_, i) => {
        const statuses: AttendanceRecord["status"][] = ["present", "absent", "late", "half_day"];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const hours = status === "present" ? 8 : status === "half_day" ? 4 : status === "late" ? 7.5 : 0;
        
        return {
          id: i + 1,
          employeeId: Math.floor(Math.random() * 10) + 1,
          employeeName: `Employee ${Math.floor(Math.random() * 10) + 1}`,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          checkIn: status !== "absent" ? "09:00" : "",
          checkOut: status !== "absent" ? "17:00" : "",
          status,
          hoursWorked: hours,
          notes: status === "late" ? "Traffic delay" : status === "absent" ? "Sick leave" : "",
        };
      });
      setRecords(dummyData);
      setLoading(false);
    };
    load();
  }, []);

  const saveRecord = async () => {
    if (!form.employeeName || !form.date) {
      toast.error("Please fill in required fields");
      return;
    }

    const checkIn = form.checkIn || "09:00";
    const checkOut = form.checkOut || "17:00";
    const hours = calculateHours(checkIn, checkOut);

    const payload: AttendanceRecord = {
      id: editingId ?? Math.max(0, ...records.map(r => r.id)) + 1,
      employeeId: form.employeeId || 1,
      employeeName: form.employeeName,
      date: form.date,
      checkIn,
      checkOut,
      status: form.status || "present",
      hoursWorked: hours,
      notes: form.notes || "",
    };

    if (editingId) {
      setRecords(prev => prev.map(r => r.id === editingId ? payload : r));
      toast.success("Attendance updated successfully");
    } else {
      setRecords(prev => [payload, ...prev]);
      toast.success("Attendance recorded successfully");
    }

    setOpen(false);
    setEditingId(null);
    setForm({ date: new Date().toISOString().split("T")[0], status: "present" });
  };

  const calculateHours = (checkIn: string, checkOut: string): number => {
    const [inH, inM] = checkIn.split(":").map(Number);
    const [outH, outM] = checkOut.split(":").map(Number);
    return (outH * 60 + outM - inH * 60 - inM) / 60;
  };

  const onEdit = (record: AttendanceRecord) => {
    setForm(record);
    setEditingId(record.id);
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    setRecords(prev => prev.filter(r => r.id !== id));
    toast.success("Record deleted successfully");
  };

  // Filtered and sorted data
  const filteredAndSortedRecords = useMemo(() => {
    let filtered = records.filter(r => {
      const matchesSearch = !searchTerm || 
        r.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesDate = !dateFilter || r.date === dateFilter;
      
      return matchesSearch && matchesStatus && matchesDate;
    });

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
  }, [records, searchTerm, statusFilter, dateFilter, sortField, sortDirection]);

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedRecords, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedRecords.length / itemsPerPage);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const stats = useMemo(() => {
    const present = records.filter(r => r.status === "present").length;
    const absent = records.filter(r => r.status === "absent").length;
    const late = records.filter(r => r.status === "late").length;
    const avgHours = records.length > 0 
      ? records.reduce((sum, r) => sum + r.hoursWorked, 0) / records.length 
      : 0;
    
    return { present, absent, late, avgHours };
  }, [records]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-lg text-[var(--color-muted-foreground)]">Loading attendance…</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Attendance</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Track employee attendance and working hours</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button 
              onClick={() => { setEditingId(null); setForm({ date: new Date().toISOString().split("T")[0], status: "present" }); }}
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-blue-200 transition"
            >
              Mark Attendance
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Attendance" : "Mark Attendance"}</DialogTitle>
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
                <Label>Date <span className="text-red-500">*</span></Label>
                <Input 
                  type="date" 
                  value={form.date ?? ""} 
                  onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Check In</Label>
                  <Input 
                    type="time" 
                    value={form.checkIn ?? ""} 
                    onChange={(e) => setForm(f => ({ ...f, checkIn: e.target.value }))} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Check Out</Label>
                  <Input 
                    type="time" 
                    value={form.checkOut ?? ""} 
                    onChange={(e) => setForm(f => ({ ...f, checkOut: e.target.value }))} 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <select 
                  value={form.status ?? "present"} 
                  onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))}
                  className="rounded-md border border-[var(--color-border)] bg-background px-3 py-2 text-sm"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="half_day">Half Day</option>
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
                onClick={saveRecord}
                className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-indigo-200 transition"
              >
                {editingId ? "Save Changes" : "Mark Attendance"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">{stats.present}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">{stats.absent}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="text-2xl font-bold text-orange-600">{stats.late}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours</CardTitle>
            <Calendar className="h-4 w-4 text-[var(--chart-3)]" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.avgHours.toFixed(1)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>Attendance Records</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8"
                />
              </div>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-40"
              />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-md border border-[var(--color-border)] bg-background px-3 py-2 text-sm w-full sm:w-32"
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half_day">Half Day</option>
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
                  <TableHead>
                    <button 
                      onClick={() => handleSort("date")}
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Date <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>
                    <button 
                      onClick={() => handleSort("hoursWorked")}
                      className="h-8 px-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded transition"
                    >
                      Hours <ArrowUpDown className="ml-2 h-3 w-3 inline" />
                    </button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-[var(--color-muted-foreground)]">
                      No records found
                    </TableCell>
                  </TableRow>
                )}
                {paginatedRecords.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.employeeName}</TableCell>
                    <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                    <TableCell>{r.checkIn || "—"}</TableCell>
                    <TableCell>{r.checkOut || "—"}</TableCell>
                    <TableCell className="font-semibold">{r.hoursWorked.toFixed(1)}h</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        r.status === "present" ? "bg-green-100 text-green-800" :
                        r.status === "absent" ? "bg-red-100 text-red-800" :
                        r.status === "late" ? "bg-orange-100 text-orange-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {r.status.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-[var(--color-muted-foreground)] text-sm">{r.notes || "—"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <button 
                        onClick={() => onEdit(r)}
                        className="inline-block bg-green-100 text-green-700 px-3 py-1 text-sm font-medium rounded-full hover:bg-green-200 transition"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => onDelete(r.id)}
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedRecords.length)} of {filteredAndSortedRecords.length} records
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