"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function PurchaseRequisitionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Purchase Requisition</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Request purchases from authorized personnel</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Purchase Requisition Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Create and manage purchase requisitions, request approvals, and convert approved requisitions to purchase orders.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}