"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function PayrollSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payroll Settings</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Configure payroll system settings</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Payroll Settings Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Configure payroll system settings including pay schedules, tax rates, benefit plans, and calculation rules.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}