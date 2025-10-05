"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, FileText, Download, Calendar, Filter } from "lucide-react";
import { toast } from "sonner";

type ReportType = "profit-loss" | "balance-sheet" | "cash-flow" | "sales-summary" | "purchase-summary" | "customer-ledger" | "supplier-ledger" | "inventory-valuation";

interface ReportFilter {
  dateFrom: string;
  dateTo: string;
  customer?: string;
  supplier?: string;
  category?: string;
}

const reportTypes = [
  { value: "profit-loss", label: "Profit & Loss Statement", icon: BarChart3, description: "Income and expenses summary" },
  { value: "balance-sheet", label: "Balance Sheet", icon: FileText, description: "Assets, liabilities, and equity" },
  { value: "cash-flow", label: "Cash Flow Statement", icon: BarChart3, description: "Cash inflows and outflows" },
  { value: "sales-summary", label: "Sales Summary", icon: FileText, description: "Sales by period and customer" },
  { value: "purchase-summary", label: "Purchase Summary", icon: FileText, description: "Purchases by period and supplier" },
  { value: "customer-ledger", label: "Customer Ledger", icon: FileText, description: "Customer transaction history" },
  { value: "supplier-ledger", label: "Supplier Ledger", icon: FileText, description: "Supplier transaction history" },
  { value: "inventory-valuation", label: "Inventory Valuation", icon: BarChart3, description: "Current stock value" },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [filters, setFilters] = useState<ReportFilter>({
    dateFrom: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0],
    dateTo: new Date().toISOString().split("T")[0],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = () => {
    if (!selectedReport) {
      toast.error("Please select a report type");
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      toast.success("Report generated successfully");
    }, 1000);
  };

  const handleExport = (format: "excel" | "pdf") => {
    if (!selectedReport) {
      toast.error("Please generate a report first");
      return;
    }
    toast.success(`Exporting report as ${format.toUpperCase()}...`);
    // In real implementation, this would trigger actual export
  };

  const selectedReportInfo = reportTypes.find(r => r.value === selectedReport);

  // Sample data for demonstration
  const sampleProfitLoss = [
    { category: "Revenue", subcategory: "Sales", amount: 125000 },
    { category: "Revenue", subcategory: "Other Income", amount: 5000 },
    { category: "Cost of Goods Sold", subcategory: "Purchases", amount: -60000 },
    { category: "Operating Expenses", subcategory: "Salaries", amount: -30000 },
    { category: "Operating Expenses", subcategory: "Rent", amount: -5000 },
    { category: "Operating Expenses", subcategory: "Utilities", amount: -2000 },
  ];

  const totalRevenue = sampleProfitLoss.filter(i => i.category === "Revenue").reduce((s, i) => s + i.amount, 0);
  const totalCOGS = Math.abs(sampleProfitLoss.filter(i => i.category === "Cost of Goods Sold").reduce((s, i) => s + i.amount, 0));
  const totalExpenses = Math.abs(sampleProfitLoss.filter(i => i.category === "Operating Expenses").reduce((s, i) => s + i.amount, 0));
  const netProfit = totalRevenue - totalCOGS - totalExpenses;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Generate and export comprehensive business reports</p>
      </div>

      {/* Report Type Selection */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const isSelected = selectedReport === report.value;
          return (
            <Card
              key={report.value}
              className={`cursor-pointer transition hover:shadow-md ${
                isSelected ? "ring-2 ring-[var(--chart-3)] bg-[var(--color-accent)]" : ""
              }`}
              onClick={() => setSelectedReport(report.value as ReportType)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Icon className={`h-5 w-5 ${isSelected ? "text-[var(--chart-3)]" : "text-[var(--color-muted-foreground)]"}`} />
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-[var(--chart-3)]" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-sm mb-1">{report.label}</h3>
                <p className="text-xs text-[var(--color-muted-foreground)]">{report.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters Section */}
      {selectedReport && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Report Filters
              </CardTitle>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm text-[var(--color-muted-foreground)] hover:text-foreground transition"
              >
                {showFilters ? "Hide" : "Show"} Filters
              </button>
            </div>
          </CardHeader>
          {showFilters && (
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="grid gap-2">
                  <Label htmlFor="dateFrom">Date From</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dateTo">Date To</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                  />
                </div>
                {(selectedReport === "sales-summary" || selectedReport === "customer-ledger") && (
                  <div className="grid gap-2">
                    <Label>Customer</Label>
                    <Select value={filters.customer} onValueChange={(val) => setFilters(f => ({ ...f, customer: val }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Customers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Customers</SelectItem>
                        <SelectItem value="1">Customer 1</SelectItem>
                        <SelectItem value="2">Customer 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {(selectedReport === "purchase-summary" || selectedReport === "supplier-ledger") && (
                  <div className="grid gap-2">
                    <Label>Supplier</Label>
                    <Select value={filters.supplier} onValueChange={(val) => setFilters(f => ({ ...f, supplier: val }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Suppliers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Suppliers</SelectItem>
                        <SelectItem value="1">Supplier 1</SelectItem>
                        <SelectItem value="2">Supplier 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Actions */}
      {selectedReport && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {generating ? "Generating..." : "Generate Report"}
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="inline-flex items-center bg-green-100 text-green-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-green-200 transition"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="inline-flex items-center bg-red-100 text-red-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-red-200 transition"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </button>
        </div>
      )}

      {/* Report Preview */}
      {selectedReport && !generating && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedReportInfo?.label}</CardTitle>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Period: {new Date(filters.dateFrom).toLocaleDateString()} - {new Date(filters.dateTo).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            {selectedReport === "profit-loss" && (
              <div className="space-y-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Subcategory</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleProfitLoss.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell>{item.subcategory}</TableCell>
                        <TableCell className={`text-right font-semibold ${item.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                          ${Math.abs(item.amount).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Total Revenue</span>
                    <span className="font-semibold text-green-600">${totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Total COGS</span>
                    <span className="font-semibold text-red-600">${totalCOGS.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Gross Profit</span>
                    <span className="font-semibold">${(totalRevenue - totalCOGS).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Total Operating Expenses</span>
                    <span className="font-semibold text-red-600">${totalExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg border-t pt-3">
                    <span className="font-bold">Net Profit</span>
                    <span className={`font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ${netProfit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {selectedReport === "balance-sheet" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-3">Assets</h3>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>Current Assets</TableCell>
                        <TableCell className="text-right font-semibold">$150,000</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Fixed Assets</TableCell>
                        <TableCell className="text-right font-semibold">$80,000</TableCell>
                      </TableRow>
                      <TableRow className="bg-[var(--color-muted)]">
                        <TableCell className="font-bold">Total Assets</TableCell>
                        <TableCell className="text-right font-bold">$230,000</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Liabilities & Equity</h3>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>Current Liabilities</TableCell>
                        <TableCell className="text-right font-semibold">$50,000</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Long-term Liabilities</TableCell>
                        <TableCell className="text-right font-semibold">$30,000</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Owner's Equity</TableCell>
                        <TableCell className="text-right font-semibold">$150,000</TableCell>
                      </TableRow>
                      <TableRow className="bg-[var(--color-muted)]">
                        <TableCell className="font-bold">Total Liabilities & Equity</TableCell>
                        <TableCell className="text-right font-bold">$230,000</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
            {selectedReport !== "profit-loss" && selectedReport !== "balance-sheet" && (
              <div className="text-center py-12 text-[var(--color-muted-foreground)]">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Report preview will appear here</p>
                <p className="text-xs mt-1">Click "Generate Report" to view data</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedReport && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-[var(--color-muted-foreground)]">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium mb-2">Select a Report Type</p>
              <p className="text-sm">Choose a report from the options above to get started</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}