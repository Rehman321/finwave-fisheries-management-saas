"use client";
import { useEffect, useState } from "react";

export type Role = "Admin" | "Manager" | "Staff";

export function useRole() {
  const [role, setRole] = useState<Role>("Admin");
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("finwave_role") : null;
    if (saved === "Admin" || saved === "Manager" || saved === "Staff") setRole(saved);
  }, []);
  const update = (r: Role) => {
    setRole(r);
    try { localStorage.setItem("finwave_role", r); } catch {}
  };
  const can = {
    create: role === "Admin" || role === "Manager",
    update: role === "Admin" || role === "Manager",
    delete: role === "Admin",
    view: true,
  } as const;
  return { role, setRole: update, can };
}