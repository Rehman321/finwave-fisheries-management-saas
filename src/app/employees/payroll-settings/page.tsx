"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings, DollarSign, Calendar, Percent } from "lucide-react";

interface PayrollSettings {
  companyName: string;
  payrollCycle: "weekly" | "bi-weekly" | "monthly";
  currency: string;
  taxRate: number;
  overtimeRate: number;
  workingHoursPerDay: number;
  workingDaysPerWeek: number;
  publicHolidayRate: number;
  leavePolicy: {
    annualLeave: number;
    sickLeave: number;
    casualLeave: number;
  };
}

export default function PayrollSettingsPage() {
  const [settings, setSettings] = useState<PayrollSettings>({
    companyName: "FinWave Fisheries",
    payrollCycle: "monthly",
    currency: "USD",
    taxRate: 10,
    overtimeRate: 1.5,
    workingHoursPerDay: 8,
    workingDaysPerWeek: 5,
    publicHolidayRate: 2.0,
    leavePolicy: {
      annualLeave: 21,
      sickLeave: 14,
      casualLeave: 7,
    },
  });
  const [loading, setLoading] = useState(false);

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Payroll settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payroll Settings</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Configure company-wide payroll rules and policies</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-[var(--chart-3)]" />
              <CardTitle>General Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Company Name</Label>
              <Input
                value={settings.companyName}
                onChange={(e) => setSettings(s => ({ ...s, companyName: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Payroll Cycle</Label>
              <select
                value={settings.payrollCycle}
                onChange={(e) => setSettings(s => ({ ...s, payrollCycle: e.target.value as any }))}
                className="rounded-md border border-[var(--color-border)] bg-background px-3 py-2 text-sm"
              >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Currency</Label>
              <Input
                value={settings.currency}
                onChange={(e) => setSettings(s => ({ ...s, currency: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[var(--chart-2)]" />
              <CardTitle>Rate Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={settings.taxRate}
                onChange={(e) => setSettings(s => ({ ...s, taxRate: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Overtime Rate (multiplier)</Label>
              <Input
                type="number"
                step="0.1"
                value={settings.overtimeRate}
                onChange={(e) => setSettings(s => ({ ...s, overtimeRate: parseFloat(e.target.value) || 0 }))}
              />
              <p className="text-xs text-[var(--color-muted-foreground)]">Standard rate × multiplier</p>
            </div>
            <div className="grid gap-2">
              <Label>Public Holiday Rate (multiplier)</Label>
              <Input
                type="number"
                step="0.1"
                value={settings.publicHolidayRate}
                onChange={(e) => setSettings(s => ({ ...s, publicHolidayRate: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[var(--chart-4)]" />
              <CardTitle>Working Hours</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Working Hours Per Day</Label>
              <Input
                type="number"
                value={settings.workingHoursPerDay}
                onChange={(e) => setSettings(s => ({ ...s, workingHoursPerDay: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Working Days Per Week</Label>
              <Input
                type="number"
                max="7"
                value={settings.workingDaysPerWeek}
                onChange={(e) => setSettings(s => ({ ...s, workingDaysPerWeek: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-[var(--chart-5)]" />
              <CardTitle>Leave Policy</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Annual Leave (days/year)</Label>
              <Input
                type="number"
                value={settings.leavePolicy.annualLeave}
                onChange={(e) => setSettings(s => ({ 
                  ...s, 
                  leavePolicy: { ...s.leavePolicy, annualLeave: parseInt(e.target.value) || 0 }
                }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Sick Leave (days/year)</Label>
              <Input
                type="number"
                value={settings.leavePolicy.sickLeave}
                onChange={(e) => setSettings(s => ({ 
                  ...s, 
                  leavePolicy: { ...s.leavePolicy, sickLeave: parseInt(e.target.value) || 0 }
                }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Casual Leave (days/year)</Label>
              <Input
                type="number"
                value={settings.leavePolicy.casualLeave}
                onChange={(e) => setSettings(s => ({ 
                  ...s, 
                  leavePolicy: { ...s.leavePolicy, casualLeave: parseInt(e.target.value) || 0 }
                }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={loading}
          className="inline-block bg-indigo-100 text-indigo-700 px-6 py-2.5 text-sm font-medium rounded-full hover:bg-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}