import { NextRequest, NextResponse } from "next/server";

// In-memory store for placeholder data
let ledger = [
  { id: 1, type: "order", ref: "ORD-1001", description: "Order payment", amount: 1250, date: new Date().toISOString() },
  { id: 2, type: "expense", ref: "EXP-2001", description: "Ice supply", amount: -150, date: new Date().toISOString() },
  { id: 3, type: "payment", ref: "PMT-3001", description: "Client payment", amount: 500, date: new Date().toISOString() },
];
let nextId = 4;

export async function GET() {
  return NextResponse.json(ledger);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const entry = {
    id: nextId++,
    type: body.type || "misc",
    ref: body.ref || `REF-${Math.floor(Math.random() * 10000)}`,
    description: body.description || "",
    amount: Number(body.amount) || 0,
    date: body.date || new Date().toISOString(),
  };
  ledger.unshift(entry);
  return NextResponse.json(entry, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const idx = ledger.findIndex(entry => entry.id === body.id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  ledger[idx] = { ...ledger[idx], ...body };
  return NextResponse.json(ledger[idx]);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  const idx = ledger.findIndex(entry => entry.id === id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const deleted = ledger.splice(idx, 1)[0];
  return NextResponse.json(deleted);
}