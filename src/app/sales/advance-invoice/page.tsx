"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function AdvanceInvoicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Advance Invoice</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Manage advance payment invoices</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Advance Invoice Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Generate invoices for advance payments or deposits from customers before order fulfillment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}