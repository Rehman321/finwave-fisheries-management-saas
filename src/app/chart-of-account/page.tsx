"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Account { 
  id: number; 
  code: string; 
  name: string; 
  type: string; 
  parentId?: number;
  balance: number;
  children?: Account[];
}

const accountTypes = [
  { value: "Asset", label: "Asset", color: "blue" },
  { value: "Liability", label: "Liability", color: "red" },
  { value: "Equity", label: "Equity", color: "purple" },
  { value: "Income", label: "Income", color: "green" },
  { value: "Expense", label: "Expense", color: "orange" },
];

export default function ChartOfAccountPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Account>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/chart-of-account");
        const data = await res.json();
        setAccounts(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load accounts");
        toast.error("Failed to load accounts");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Build tree structure
  const buildTree = (accounts: Account[]): Account[] => {
    const accountMap = new Map<number, Account>();
    const roots: Account[] = [];

    accounts.forEach(acc => {
      accountMap.set(acc.id, { ...acc, children: [] });
    });

    accounts.forEach(acc => {
      const account = accountMap.get(acc.id)!;
      if (acc.parentId && accountMap.has(acc.parentId)) {
        accountMap.get(acc.parentId)!.children!.push(account);
      } else {
        roots.push(account);
      }
    });

    return roots;
  };

  const accountTree = buildTree(accounts);

  const toggleNode = (id: number) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const saveAccount = async () => {
    if (!form.code?.trim() || !form.name?.trim()) {
      toast.error("Code and name are required");
      return;
    }

    const payload: Account = {
      id: editingId ?? Math.max(0, ...accounts.map(a => a.id)) + 1,
      code: String(form.code ?? "").trim(),
      name: String(form.name ?? "").trim(),
      type: String(form.type ?? "Asset"),
      parentId: form.parentId,
      balance: Number(form.balance ?? 0),
    };
    
    try {
      if (editingId) {
        setAccounts(prev => prev.map(a => a.id === editingId ? payload : a));
        await fetch("/api/chart-of-account", { 
          method: "PATCH", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload) 
        });
        toast.success("Account updated successfully");
      } else {
        setAccounts(prev => [payload, ...prev]);
        await fetch("/api/chart-of-account", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload) 
        });
        toast.success("Account created successfully");
      }
      
      setOpen(false);
      setEditingId(null);
      setForm({});
    } catch (e) {
      toast.error("Failed to save account");
    }
  };

  const onEdit = (account: Account) => {
    setForm(account);
    setEditingId(account.id);
    setOpen(true);
  };

  const onDelete = async (id: number) => {
    const hasChildren = accounts.some(a => a.parentId === id);
    if (hasChildren) {
      toast.error("Cannot delete account with sub-accounts");
      return;
    }
    
    if (!confirm("Are you sure you want to delete this account?")) return;
    
    try {
      setAccounts(prev => prev.filter(a => a.id !== id));
      await fetch(`/api/chart-of-account?id=${id}`, { method: "DELETE" });
      toast.success("Account deleted successfully");
    } catch (e) {
      toast.error("Failed to delete account");
    }
  };

  const AccountNode = ({ account, depth = 0 }: { account: Account; depth?: number }) => {
    const hasChildren = account.children && account.children.length > 0;
    const isExpanded = expandedNodes.has(account.id);
    const typeInfo = accountTypes.find(t => t.value === account.type);

    return (
      <div>
        <div 
          className="flex items-center gap-2 py-2 px-3 hover:bg-[var(--color-accent)] rounded-lg transition group"
          style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
        >
          <button
            onClick={() => toggleNode(account.id)}
            className="flex-shrink-0 w-5 h-5"
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              ) : (
                <ChevronRight className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              )
            ) : (
              <span className="w-4 h-4 inline-block" />
            )}
          </button>

          <div className="flex-1 flex items-center gap-3">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-${typeInfo?.color}-100 text-${typeInfo?.color}-700`}>
              {account.code}
            </span>
            <span className="font-medium">{account.name}</span>
            <span className="text-xs text-[var(--color-muted-foreground)]">({account.type})</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold">${account.balance.toLocaleString()}</span>
            <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
              <button
                onClick={() => onEdit(account)}
                className="p-1 hover:bg-green-100 rounded transition"
                title="Edit"
              >
                <Edit2 className="h-3.5 w-3.5 text-green-700" />
              </button>
              <button
                onClick={() => onDelete(account.id)}
                className="p-1 hover:bg-red-100 rounded transition"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-700" />
              </button>
              <button
                onClick={() => {
                  setForm({ parentId: account.id, type: account.type });
                  setEditingId(null);
                  setOpen(true);
                }}
                className="p-1 hover:bg-blue-100 rounded transition"
                title="Add sub-account"
              >
                <Plus className="h-3.5 w-3.5 text-blue-700" />
              </button>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {account.children!.map(child => (
              <AccountNode key={child.id} account={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-lg text-[var(--color-muted-foreground)]">Loading accounts…</div>
    </div>
  );
  
  if (error) return <div className="text-red-500">{error}</div>;

  const totalAssets = accounts.filter(a => a.type === "Asset").reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.type === "Liability").reduce((s, a) => s + a.balance, 0);
  const totalEquity = accounts.filter(a => a.type === "Equity").reduce((s, a) => s + a.balance, 0);
  const totalIncome = accounts.filter(a => a.type === "Income").reduce((s, a) => s + a.balance, 0);
  const totalExpense = accounts.filter(a => a.type === "Expense").reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Chart of Accounts</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Hierarchical view of your accounting structure</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button 
              onClick={() => { setEditingId(null); setForm({}); }}
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-blue-200 transition"
            >
              New Account
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Account" : "Add Account"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="code">Account Code <span className="text-red-500">*</span></Label>
                <Input 
                  id="code" 
                  placeholder="e.g., 1000"
                  value={form.code ?? ""} 
                  onChange={(e) => setForm(f => ({...f, code: e.target.value}))} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Account Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Cash"
                  value={form.name ?? ""} 
                  onChange={(e) => setForm(f => ({...f, name: e.target.value}))} 
                />
              </div>
              <div className="grid gap-2">
                <Label>Account Type</Label>
                <select 
                  value={form.type ?? "Asset"} 
                  onChange={(e) => setForm(f => ({...f, type: e.target.value}))} 
                  className="rounded-md border border-[var(--color-border)] bg-background px-3 py-2 text-sm"
                >
                  {accountTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Parent Account (Optional)</Label>
                <select 
                  value={form.parentId ?? ""} 
                  onChange={(e) => setForm(f => ({...f, parentId: e.target.value ? Number(e.target.value) : undefined}))} 
                  className="rounded-md border border-[var(--color-border)] bg-background px-3 py-2 text-sm"
                >
                  <option value="">None (Root Account)</option>
                  {accounts
                    .filter(a => a.id !== editingId)
                    .map(a => (
                      <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                    ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="balance">Opening Balance</Label>
                <Input 
                  id="balance" 
                  type="number" 
                  step="0.01"
                  value={form.balance ?? 0} 
                  onChange={(e) => setForm(f => ({...f, balance: Number(e.target.value)}))} 
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
                onClick={saveAccount}
                className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 text-sm font-medium rounded-full hover:bg-indigo-200 transition"
              >
                {editingId ? "Save Changes" : "Create"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader><CardTitle>Assets</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-blue-600">${totalAssets.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Liabilities</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">${totalLiabilities.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Equity</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-purple-600">${totalEquity.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Income</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Expense</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-orange-600">${totalExpense.toLocaleString()}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Account Hierarchy</CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setExpandedNodes(new Set(accounts.map(a => a.id)))}
                className="text-xs text-[var(--color-muted-foreground)] hover:text-foreground transition"
              >
                Expand All
              </button>
              <span className="text-[var(--color-muted-foreground)]">•</span>
              <button
                onClick={() => setExpandedNodes(new Set())}
                className="text-xs text-[var(--color-muted-foreground)] hover:text-foreground transition"
              >
                Collapse All
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {accountTree.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-muted-foreground)]">
              No accounts yet. Create your first account to get started.
            </div>
          ) : (
            <div className="space-y-1">
              {accountTree.map(account => (
                <AccountNode key={account.id} account={account} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}