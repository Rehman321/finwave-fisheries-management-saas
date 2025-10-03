"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function BillsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bills</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Manage supplier bills and payments</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bills Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Record, track, and pay supplier bills. Manage payment terms and track outstanding amounts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}