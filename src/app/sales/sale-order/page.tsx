"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export default function SaleOrderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Sale Order</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Manage confirmed sales orders</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Sale Order Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Process and track confirmed sales orders, manage fulfillment status, and prepare for delivery.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}