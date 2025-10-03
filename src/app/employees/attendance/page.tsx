"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">Track employee attendance and time</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Attendance Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Record and track employee attendance, work hours, leaves, overtime, and generate attendance reports.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}