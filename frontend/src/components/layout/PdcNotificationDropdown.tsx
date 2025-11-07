"use client";
import { Bell, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePdcNotifications } from "@/hooks/usePdcNotifications";
import Link from "next/link";

export function PdcNotificationDropdown() {
  const { urgentCheques, count, loading, getDaysUntilDue } = usePdcNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="border-b border-[var(--color-border)] p-3">
          <h3 className="font-semibold">PDC Notifications</h3>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Cheques due within 7 days
          </p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-[var(--color-muted-foreground)]">
              Loading notifications...
            </div>
          ) : count === 0 ? (
            <div className="p-4 text-center text-sm text-[var(--color-muted-foreground)]">
              No urgent cheques
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {urgentCheques.map((cheque) => {
                const days = getDaysUntilDue(cheque.dueDate);
                const isCritical = days <= 2;
                return (
                  <Link
                    key={cheque.id}
                    href="/pdc"
                    className="block p-3 transition-colors hover:bg-[var(--color-muted)]/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 shrink-0 text-[var(--color-muted-foreground)]" />
                          <span className="font-medium text-sm truncate">
                            {cheque.chequeNo}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 truncate">
                          {cheque.client}
                        </p>
                        <p className="text-sm font-semibold mt-1">
                          ${cheque.amount.toFixed(2)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          isCritical
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                        }`}
                      >
                        {days === 0
                          ? "Today"
                          : days === 1
                          ? "Tomorrow"
                          : `${days}d`}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        {count > 0 && (
          <div className="border-t border-[var(--color-border)] p-2">
            <Link href="/pdc">
              <Button variant="ghost" className="w-full text-xs">
                View All Cheques
              </Button>
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}