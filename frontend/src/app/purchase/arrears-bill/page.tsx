"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function ArrearsBillPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Arrears Bill</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Manage overdue payment bills</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Arrears Bill Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Track and manage bills with overdue payments to suppliers, schedule payments, and handle payment reminders.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}