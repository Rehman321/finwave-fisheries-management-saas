"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Fish, Boxes, ShoppingCart, Users, Home, Landmark, Banknote, Wallet, UserCircle, Building2, FileText, Package, DollarSign, Calculator, Tag, UsersRound, BarChart3, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import React, { useState } from "react";
import { useRole } from "@/hooks/useRole";
import { PdcNotificationDropdown } from "./PdcNotificationDropdown";

const nav = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/customers", label: "Customer", icon: UserCircle },
  { href: "/suppliers", label: "Supplier", icon: Building2 },
  { 
    label: "Sales", 
    icon: ShoppingCart,
    subItems: [
      { href: "/sales/quotation", label: "Quotation" },
      { href: "/sales/sale-order", label: "Sale Order" },
      { href: "/sales/delivery-note", label: "Delivery Note" },
      { href: "/sales/return-delivery-note", label: "Return Delivery Note" },
      { href: "/sales/invoice", label: "Invoice" },
      { href: "/sales/advance-invoice", label: "Advance Invoice" },
      { href: "/sales/arrears-invoice", label: "Arrears Invoice" },
      { href: "/sales/refund-invoice", label: "Refund Invoice" },
    ]
  },
  { 
    label: "Purchase", 
    icon: Package,
    subItems: [
      { href: "/purchase/requisition", label: "Purchase Requisition" },
      { href: "/purchase/order", label: "Purchase Order" },
      { href: "/purchase/goods-received", label: "Goods Received Note" },
      { href: "/purchase/return-goods-received", label: "Return Goods Receive Note" },
      { href: "/purchase/bills", label: "Bills" },
      { href: "/purchase/advance-bill", label: "Advance Bill" },
      { href: "/purchase/arrears-bill", label: "Arrears Bill" },
      { href: "/purchase/refund-bill", label: "Refund Bill" },
    ]
  },
  { href: "/expenses", label: "Expense", icon: Wallet },
  { href: "/chart-of-account", label: "Chart of Account", icon: Calculator },
  { href: "/products", label: "Products/Items", icon: Boxes },
  { href: "/tax-center", label: "Tax Center", icon: Tag },
  { 
    label: "Employees", 
    icon: UsersRound,
    subItems: [
      { href: "/employees/additions-deductions", label: "Additions & Deductions" },
      { href: "/employees/payroll-settings", label: "Payroll Settings" },
      { href: "/employees/payroll-periods", label: "Payroll Periods" },
      { href: "/employees/payroll-generation", label: "Payroll Generation" },
      { href: "/employees/salary-payments", label: "Salary Payments" },
      { href: "/employees/attendance", label: "Attendance" },
    ]
  },
  { href: "/pdc", label: "PDC", icon: Banknote },
  { href: "/ledger", label: "Ledger", icon: Landmark },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

function NavItem({ item }: { item: typeof nav[0] }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if ('subItems' in item && item.subItems) {
    const Icon = item.icon;
    const hasActiveChild = item.subItems.some(sub => pathname === sub.href);
    
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]/60">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 space-y-1">
          {item.subItems.map((subItem) => {
            const active = pathname === subItem.href;
            return (
              <Link
                key={subItem.href}
                href={subItem.href}
                className={`flex items-center rounded-md py-2 pl-9 pr-3 text-sm transition-colors ${
                  active
                    ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
                    : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]/60"
                }`}
              >
                {subItem.label}
              </Link>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  const Icon = item.icon;
  const active = pathname === item.href;
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
          : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]/60"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{item.label}</span>
    </Link>
  );
}

function Sidebar({ isOpen }: { isOpen: boolean }) {
  return (
    <aside 
      className={`hidden md:flex shrink-0 border-r border-[var(--color-border)] bg-[var(--sidebar)] transition-all duration-300 ${
        isOpen ? "md:w-64" : "md:w-0"
      }`}
    >
      <div className={`flex h-full w-64 flex-col gap-2 overflow-y-auto p-4 ${isOpen ? "opacity-100" : "opacity-0"}`}>
        <Link href="/" className="mb-2 flex items-center gap-2 text-lg font-semibold">
          <Fish className="h-5 w-5 text-[var(--sidebar-primary)]" />
          <span>FinWave</span>
        </Link>
        <nav className="grid gap-1">
          {nav.map((item, idx) => (
            <NavItem key={idx} item={item} />
          ))}
        </nav>
        <div className="mt-auto text-xs text-[var(--muted-foreground)]">© {new Date().getFullYear()} FinWave</div>
      </div>
    </aside>
  );
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="p-4">
          <SheetTitle className="flex items-center gap-2">
            <Fish className="h-5 w-5 text-[var(--sidebar-primary)]" />
            FinWave
          </SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto p-4">
          <nav className="grid gap-1">
            {nav.map((item, idx) => (
              <NavItem key={idx} item={item} />
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { role, setRole } = useRole();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--background)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <MobileNav />
          
          {/* Desktop Sidebar Toggle */}
          <Button 
            variant="outline" 
            size="icon" 
            className="hidden md:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link href="/" className="hidden md:flex items-center gap-2 text-base font-semibold">
            <Fish className="h-5 w-5 text-[var(--sidebar-primary)]" />
            <span>FinWave</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {/* PDC Notification Bell */}
            <PdcNotificationDropdown />
            
            {/* Role Switcher */}
            <label className="text-xs text-[var(--color-muted-foreground)]">Role</label>
            <select
              className="rounded-md border border-[var(--color-border)] bg-background px-2 py-1 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
            >
              <option>Admin</option>
              <option>Manager</option>
              <option>Staff</option>
            </select>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl">
        <Sidebar isOpen={sidebarOpen} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}