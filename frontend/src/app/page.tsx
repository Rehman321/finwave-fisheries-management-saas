"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Users, Package, FileText, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Inv { id: number; name: string; stockKg: number; pricePerKg: number; availability: string }
interface Order { id: number; clientName: string; fishName: string; quantityKg: number; pricePerKg: number; status: string; createdAt: string }
interface Purchase { id: number; supplier: string; date: string; invoiceNo: string; amount: number; status: string }
interface Expense { id: number; amount: number; ref: string; category: string; description: string; date: string }
interface Cheque { id: number; chequeNo: string; client: string; amount: number; dueDate: string; status: "pending"|"cleared"|"bounced" }
interface LedgerEntry { id: number; date: string; description: string; debit: number; credit: number; balance: number; type: string }
interface Transaction { id: string; date: string; description: string; type: "sale" | "purchase" | "expense"; amount: number; status: string }
interface Customer { id: number; name: string; email: string; phone: string; outstandingBalance: number }

export default function DashboardPage() {
  const [inventory, setInventory] = useState<Inv[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pdc, setPdc] = useState<Cheque[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [invRes, ordRes, purRes, expRes, pdcRes, ledRes, custRes] = await Promise.all([
        fetch("/api/inventory").then(r => r.json()),
        fetch("/api/orders").then(r => r.json()),
        fetch("/api/purchases").then(r => r.json()),
        fetch("/api/expenses").then(r => r.json()),
        fetch("/api/pdc").then(r => r.json()),
        fetch("/api/ledger").then(r => r.json()),
        fetch("/api/customers").then(r => r.json()),
      ]);
      setInventory(invRes);
      setOrders(ordRes);
      setPurchases(purRes);
      setExpenses(expRes);
      setPdc(pdcRes);
      setLedger(ledRes);
      setCustomers(custRes);
      setLoading(false);
    };
    load();
  }, []);

  // Calculate key metrics
  const totalSales = useMemo(() => orders.reduce((s, o) => s + o.quantityKg * o.pricePerKg, 0), [orders]);
  const totalPurchases = useMemo(() => purchases.reduce((s, p) => s + p.amount, 0), [purchases]);
  const pendingPDCs = useMemo(() => pdc.filter(c => c.status === "pending").reduce((s, c) => s + c.amount, 0), [pdc]);
  const outstandingBalance = useMemo(() => {
    const lastEntry = ledger[ledger.length - 1];
    return lastEntry ? lastEntry.balance : 0;
  }, [ledger]);

  // Customer metrics
  const totalCustomers = customers.length;
  const activeCustomers = useMemo(() => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const activeClientNames = new Set(
      orders.filter(o => new Date(o.createdAt) >= last30Days).map(o => o.clientName)
    );
    return activeClientNames.size;
  }, [orders]);

  // Inventory metrics
  const totalInventoryValue = useMemo(() => 
    inventory.reduce((s, i) => s + i.stockKg * i.pricePerKg, 0), 
    [inventory]
  );
  const lowStockItems = useMemo(() => 
    inventory.filter(i => i.stockKg < 50).length, 
    [inventory]
  );

  // Order status breakdown
  const ordersByStatus = useMemo(() => {
    const pending = orders.filter(o => o.status === "pending").length;
    const completed = orders.filter(o => o.status === "completed").length;
    const cancelled = orders.filter(o => o.status === "cancelled").length;
    return { pending, completed, cancelled };
  }, [orders]);

  // PDC status breakdown
  const pdcByStatus = useMemo(() => {
    const pending = pdc.filter(c => c.status === "pending");
    const cleared = pdc.filter(c => c.status === "cleared");
    const bounced = pdc.filter(c => c.status === "bounced");
    return [
      { status: "Pending", count: pending.length, amount: pending.reduce((s, c) => s + c.amount, 0), color: "var(--chart-4)" },
      { status: "Cleared", count: cleared.length, amount: cleared.reduce((s, c) => s + c.amount, 0), color: "var(--chart-2)" },
      { status: "Bounced", count: bounced.length, amount: bounced.reduce((s, c) => s + c.amount, 0), color: "var(--color-destructive)" },
    ];
  }, [pdc]);

  // Top customers by revenue
  const topCustomers = useMemo(() => {
    const customerRevenue = orders.reduce((acc, order) => {
      const revenue = order.quantityKg * order.pricePerKg;
      acc[order.clientName] = (acc[order.clientName] || 0) + revenue;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(customerRevenue)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  // Expense breakdown by category
  const expensesByCategory = useMemo(() => {
    const categories = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  // Stock levels data
  const stockLevelsData = useMemo(() => 
    inventory.slice(0, 8).map(item => ({
      name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
      stock: item.stockKg,
      lowStock: item.stockKg < 50
    })), 
    [inventory]
  );

  // Recent Transactions (combine sales, purchases, expenses)
  const recentTransactions = useMemo((): Transaction[] => {
    const salesTx: Transaction[] = orders.slice(0, 5).map(o => ({
      id: `sale-${o.id}`,
      date: o.createdAt,
      description: `Sale to ${o.clientName} - ${o.fishName}`,
      type: "sale" as const,
      amount: o.quantityKg * o.pricePerKg,
      status: o.status,
    }));
    
    const purchasesTx: Transaction[] = purchases.slice(0, 5).map(p => ({
      id: `purchase-${p.id}`,
      date: p.date,
      description: `Purchase from ${p.supplier} - ${p.invoiceNo}`,
      type: "purchase" as const,
      amount: p.amount,
      status: p.status,
    }));
    
    const expensesTx: Transaction[] = expenses.slice(0, 5).map(e => ({
      id: `expense-${e.id}`,
      date: e.date,
      description: `${e.category} - ${e.description}`,
      type: "expense" as const,
      amount: Number(e.amount),
      status: "completed",
    }));
    
    return [...salesTx, ...purchasesTx, ...expensesTx]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [orders, purchases, expenses]);

  // Monthly sales vs purchases chart data
  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthName = months[monthIndex];
      
      const monthSales = orders
        .filter(o => new Date(o.createdAt).getMonth() === monthIndex)
        .reduce((s, o) => s + o.quantityKg * o.pricePerKg, 0);
      
      const monthPurchases = purchases
        .filter(p => new Date(p.date).getMonth() === monthIndex)
        .reduce((s, p) => s + p.amount, 0);
      
      last6Months.push({
        month: monthName,
        sales: Math.round(monthSales),
        purchases: Math.round(monthPurchases),
      });
    }
    
    return last6Months;
  }, [orders, purchases]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-lg text-[var(--color-muted-foreground)]">Loading dashboard…</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Overview of your business operations</p>
        </div>
      </div>

      {/* Key Metrics - Row 1 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-[var(--chart-2)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">All-time revenue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <TrendingDown className="h-4 w-4 text-[var(--chart-1)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPurchases.toFixed(2)}</div>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">All-time procurement</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending PDCs</CardTitle>
            <AlertCircle className="h-4 w-4 text-[var(--chart-4)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingPDCs.toFixed(2)}</div>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">Awaiting clearance</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-[var(--chart-5)]" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${outstandingBalance >= 0 ? "text-[var(--chart-2)]" : "text-[var(--color-destructive)]"}`}>
              ${Math.abs(outstandingBalance).toFixed(2)}
            </div>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
              {outstandingBalance >= 0 ? "Receivable" : "Payable"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics - Row 2 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-[var(--chart-3)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
              {activeCustomers} active this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-[var(--chart-5)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInventoryValue.toFixed(2)}</div>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
              {inventory.length} items in stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Status</CardTitle>
            <FileText className="h-4 w-4 text-[var(--chart-2)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <div className="flex gap-3 mt-2 text-xs">
              <span className="text-[var(--chart-4)]">⬤ {ordersByStatus.pending} Pending</span>
              <span className="text-[var(--chart-2)]">⬤ {ordersByStatus.completed} Done</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-[var(--color-destructive)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
              Items below 50kg threshold
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Monthly Sales vs Purchases Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales vs Purchases</CardTitle>
            <p className="text-sm text-[var(--color-muted-foreground)]">Last 6 months financial overview</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "var(--color-card)", 
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Bar dataKey="sales" fill="var(--chart-2)" name="Sales" radius={[8, 8, 0, 0]} />
                <Bar dataKey="purchases" fill="var(--chart-1)" name="Purchases" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* PDC Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>PDC Status Overview</CardTitle>
            <p className="text-sm text-[var(--color-muted-foreground)]">Post-dated cheques breakdown</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pdcByStatus.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <p className="font-medium">{item.status}</p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">
                        {item.count} cheque{item.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${item.amount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <Link 
                  href="/pdc" 
                  className="text-sm text-[var(--chart-3)] hover:underline"
                >
                  View all PDCs →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Stock Levels Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Current Stock Levels</CardTitle>
            <p className="text-sm text-[var(--color-muted-foreground)]">Inventory by item (kg)</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockLevelsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--color-muted-foreground)" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "var(--color-card)", 
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px"
                  }}
                />
                <Bar 
                  dataKey="stock" 
                  fill="var(--chart-3)" 
                  name="Stock (kg)" 
                  radius={[8, 8, 0, 0]}
                >
                  {stockLevelsData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.lowStock ? "var(--color-destructive)" : "var(--chart-3)"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <p className="text-sm text-[var(--color-muted-foreground)]">By category</p>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props) => {
                      const { name, percent } = props as unknown as { name: string, percent: number };
                      return `${name} ${(percent * 100).toFixed(0)}%`;
                    }}
                    outerRadius={80}
                    fill="var(--chart-1)"
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => {
                      const colors = [
                        "var(--chart-1)",
                        "var(--chart-2)",
                        "var(--chart-3)",
                        "var(--chart-4)",
                        "var(--chart-5)"
                      ];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--color-card)", 
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-[var(--color-muted-foreground)]">
                No expense data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <p className="text-sm text-[var(--color-muted-foreground)]">By revenue generated</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.length > 0 ? (
                  topCustomers.map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell className="text-right font-semibold text-[var(--chart-2)]">
                        ${customer.revenue.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-[var(--color-muted-foreground)]">
                      No customer data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <p className="text-sm text-[var(--color-muted-foreground)]">Latest activities</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{tx.description}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize
                        ${tx.type === "sale" ? "bg-[var(--chart-2)] bg-opacity-10 text-[var(--chart-2)]" : ""}
                        ${tx.type === "purchase" ? "bg-[var(--chart-1)] bg-opacity-10 text-[var(--chart-1)]" : ""}
                        ${tx.type === "expense" ? "bg-[var(--chart-5)] bg-opacity-10 text-[var(--chart-5)]" : ""}
                      `}>
                        {tx.type}
                      </span>
                      <span className="text-xs text-[var(--color-muted-foreground)]">
                        {new Date(tx.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold">${tx.amount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}