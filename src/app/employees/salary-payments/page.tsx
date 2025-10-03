"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function SalaryPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Salary Payments</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Process and track salary payments</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Salary Payments Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Process salary payments to employees, generate pay slips, and track payment history.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}