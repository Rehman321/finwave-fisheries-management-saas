"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function InvoicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Invoice</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Generate and manage sales invoices</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Create, send, and track invoices for completed sales. Manage payment terms and track outstanding amounts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}