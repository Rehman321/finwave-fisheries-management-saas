"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";

export default function RefundInvoicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Refund Invoice</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Process customer refunds</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Refund Invoice Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Generate refund invoices for returned goods or cancelled orders, and process refund payments to customers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}