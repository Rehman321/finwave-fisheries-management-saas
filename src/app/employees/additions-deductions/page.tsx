"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function AdditionsDeductionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Additions & Deductions</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Manage salary additions and deductions</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Additions & Deductions Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Configure and manage salary additions (bonuses, allowances) and deductions (taxes, insurance, loans) for employees.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}