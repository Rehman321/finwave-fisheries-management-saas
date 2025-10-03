"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function PurchaseOrderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Purchase Order</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Manage purchase orders to suppliers</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Purchase Order Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Create, send, and track purchase orders to suppliers. Manage delivery schedules and order status.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}