import { NextRequest, NextResponse } from "next/server";

// In-memory PDC placeholder data
let cheques = [
  { id: 1, chequeNo: "CHQ-0001", client: "Ocean Foods Ltd", amount: 800, dueDate: new Date(Date.now() + 3*24*60*60*1000).toISOString(), status: "pending" },
  { id: 2, chequeNo: "CHQ-0002", client: "Harbor Traders", amount: 1200, dueDate: new Date(Date.now() + 10*24*60*60*1000).toISOString(), status: "pending" },
  { id: 3, chequeNo: "CHQ-0003", client: "Coral Bay", amount: 500, dueDate: new Date(Date.now() - 2*24*60*60*1000).toISOString(), status: "cleared" },
];
let nextPdcId = 4;

export async function GET() {
  return NextResponse.json(cheques);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = {
    id: nextPdcId++,
    chequeNo: body.chequeNo || `CHQ-${Math.floor(Math.random() * 9999).toString().padStart(4, "0")}`,
    client: body.client || "Unknown",
    amount: Number(body.amount) || 0,
    dueDate: body.dueDate || new Date().toISOString(),
    status: body.status || "pending",
  } as {
    id: number; chequeNo: string; client: string; amount: number; dueDate: string; status: "pending"|"cleared"|"bounced";
  };
  cheques.unshift(item);
  return NextResponse.json(item, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status } = body as { id: number; status: "pending"|"cleared"|"bounced" };
  const idx = cheques.findIndex(c => c.id === id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  cheques[idx] = { ...cheques[idx], ...body };
  return NextResponse.json(cheques[idx]);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  const idx = cheques.findIndex(c => c.id === id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const deleted = cheques.splice(idx, 1)[0];
  return NextResponse.json(deleted);
}