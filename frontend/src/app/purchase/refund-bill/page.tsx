"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";

export default function RefundBillPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Refund Bill</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Process refunds from suppliers</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Refund Bill Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Record refund bills for returned goods or cancelled purchase orders, and track refunds received from suppliers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}