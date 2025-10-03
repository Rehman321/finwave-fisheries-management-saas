"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from "lucide-react";

export default function GoodsReceivedPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Goods Received Note</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Track goods received from suppliers</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Goods Received Note Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Record and verify goods received from suppliers, update inventory, and match with purchase orders.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}