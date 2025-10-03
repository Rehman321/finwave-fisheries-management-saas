"use client";
import { useEffect, useState } from "react";

interface Cheque {
  id: number;
  chequeNo: string;
  client: string;
  amount: number;
  dueDate: string;
  status: "pending" | "cleared" | "bounced";
}

export function usePdcNotifications() {
  const [urgentCheques, setUrgentCheques] = useState<Cheque[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrgentCheques = async () => {
      try {
        const res = await fetch("/api/pdc");
        const data = await res.json();
        
        const now = Date.now();
        const sevenDaysFromNow = now + (7 * 24 * 60 * 60 * 1000);
        
        const urgent = data.filter((c: Cheque) => {
          const dueTime = new Date(c.dueDate).getTime();
          return c.status === "pending" && dueTime >= now && dueTime <= sevenDaysFromNow;
        }).sort((a: Cheque, b: Cheque) => 
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
        
        setUrgentCheques(urgent);
      } catch (error) {
        console.error("Failed to fetch PDC notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUrgentCheques();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchUrgentCheques, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getDaysUntilDue = (dueDate: string) => {
    const now = Date.now();
    const due = new Date(dueDate).getTime();
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  };

  return {
    urgentCheques,
    count: urgentCheques.length,
    loading,
    getDaysUntilDue,
  };
}