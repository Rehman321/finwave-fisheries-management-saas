import { NextResponse } from "next/server";

let seed = [
  { id: 1, code: "1000", name: "Cash", type: "Asset", balance: 50000 },
  { id: 2, code: "1100", name: "Accounts Receivable", type: "Asset", balance: 15000 },
  { id: 3, code: "2000", name: "Accounts Payable", type: "Liability", balance: 8000 },
  { id: 4, code: "3000", name: "Owner's Equity", type: "Equity", balance: 57000 },
  { id: 5, code: "4000", name: "Revenue", type: "Income", balance: 120000 },
  { id: 6, code: "5000", name: "Cost of Goods Sold", type: "Expense", balance: 45000 },
];

export async function GET() {
  return NextResponse.json(seed);
}

export async function POST(req: Request) {
  const body = await req.json();
  seed = [body, ...seed];
  return NextResponse.json(body, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const idx = seed.findIndex(account => account.id === body.id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  seed[idx] = { ...seed[idx], ...body };
  return NextResponse.json(seed[idx]);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  const idx = seed.findIndex(account => account.id === id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const deleted = seed.splice(idx, 1)[0];
  return NextResponse.json(deleted);
}