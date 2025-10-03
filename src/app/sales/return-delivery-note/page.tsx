"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TruckIcon } from "lucide-react";

export default function ReturnDeliveryNotePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Return Delivery Note</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Manage returns from customers</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5" />
            Return Delivery Note Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Process and track goods returned by customers, update inventory, and manage return reasons.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}