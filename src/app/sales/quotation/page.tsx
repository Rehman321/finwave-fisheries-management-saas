"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function QuotationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Quotation</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Create and manage sales quotations</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quotation Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Create, send, and track quotations for potential customers. Manage pricing, terms, and convert quotations to sale orders.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}