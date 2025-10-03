"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Generate and view comprehensive business reports</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Business Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            This module will provide comprehensive reporting capabilities including financial reports, sales analytics, inventory reports, and custom reports.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}