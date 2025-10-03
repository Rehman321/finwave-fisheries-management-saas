import { NextRequest, NextResponse } from "next/server";

// In-memory Expenses placeholder data
let expenses = [
  { id: 1, ref: "EXP-2001", category: "Ice", description: "Ice blocks for storage", amount: 150, date: new Date().toISOString() },
  { id: 2, ref: "EXP-2002", category: "Fuel", description: "Boat fuel", amount: 320, date: new Date().toISOString() },
];
let nextExpenseId = 3;

export async function GET() {
  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = {
    id: nextExpenseId++,
    ref: body.ref || `EXP-${Math.floor(Math.random() * 9999).toString().padStart(4, "0")}`,
    category: body.category || "General",
    description: body.description || "",
    amount: Math.max(0, Number(body.amount) || 0),
    date: body.date || new Date().toISOString(),
  } as { id: number; ref: string; category: string; description: string; amount: number; date: string };
  expenses.unshift(item);
  return NextResponse.json(item, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const idx = expenses.findIndex(exp => exp.id === body.id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  expenses[idx] = { ...expenses[idx], ...body };
  return NextResponse.json(expenses[idx]);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  const idx = expenses.findIndex(exp => exp.id === id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const deleted = expenses.splice(idx, 1)[0];
  return NextResponse.json(deleted);
}