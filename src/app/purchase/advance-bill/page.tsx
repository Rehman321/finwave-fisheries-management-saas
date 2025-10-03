"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function AdvanceBillPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Advance Bill</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Manage advance payment bills</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Advance Bill Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Record and track advance payments or deposits made to suppliers before order fulfillment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}