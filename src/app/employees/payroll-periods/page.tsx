"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function PayrollPeriodsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payroll Periods</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Manage payroll periods and cycles</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Payroll Periods Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Define and manage payroll periods, set pay cycles (weekly, bi-weekly, monthly), and track period status.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}