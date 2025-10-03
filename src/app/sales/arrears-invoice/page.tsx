"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function ArrearsInvoicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Arrears Invoice</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Manage overdue payment invoices</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Arrears Invoice Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Track and manage invoices with overdue payments, send reminders, and handle payment collection.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}