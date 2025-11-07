import { NextResponse } from "next/server";

interface Purchase {
  id: number;
  supplier: string;
  date: string;
  invoiceNo: string;
  amount: number;
  status: "paid" | "unpaid" | "partially_paid";
}

let purchases: Purchase[] = [
  { id: 1, supplier: "Ocean Fresh Suppliers", date: "2025-01-15", invoiceNo: "PO-001", amount: 15000, status: "paid" },
  { id: 2, supplier: "Marine Wholesale Ltd", date: "2025-01-18", invoiceNo: "PO-002", amount: 8500, status: "unpaid" },
  { id: 3, supplier: "Coastal Fish Market", date: "2025-01-20", invoiceNo: "PO-003", amount: 12000, status: "partially_paid" },
  { id: 4, supplier: "Deep Sea Trading", date: "2025-01-22", invoiceNo: "PO-004", amount: 20000, status: "paid" },
  { id: 5, supplier: "Pacific Catch Co", date: "2025-01-25", invoiceNo: "PO-005", amount: 9500, status: "unpaid" },
];

export async function GET() {
  return NextResponse.json(purchases);
}

export async function POST(req: Request) {
  const body = await req.json();
  const newPurchase: Purchase = {
    id: purchases.length + 1,
    supplier: body.supplier,
    date: body.date,
    invoiceNo: body.invoiceNo,
    amount: body.amount,
    status: body.status || "unpaid",
  };
  purchases.push(newPurchase);
  return NextResponse.json(newPurchase, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const index = purchases.findIndex(p => p.id === body.id);
  if (index === -1) return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  purchases[index] = { ...purchases[index], ...body };
  return NextResponse.json(purchases[index]);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  purchases = purchases.filter(p => p.id !== parseInt(id));
  return NextResponse.json({ success: true });
}