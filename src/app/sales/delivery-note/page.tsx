"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from "lucide-react";

export default function DeliveryNotePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Delivery Note</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Track goods delivered to customers</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Note Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Generate delivery notes, track shipments, and confirm goods delivered to customers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}