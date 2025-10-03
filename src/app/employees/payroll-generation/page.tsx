"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

export default function PayrollGenerationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payroll Generation</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Generate employee payroll</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Payroll Generation Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Generate payroll for employees based on attendance, additions, deductions, and configured pay schedules.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}