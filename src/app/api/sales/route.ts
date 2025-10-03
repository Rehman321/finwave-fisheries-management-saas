import { NextResponse } from "next/server";

interface SaleLineItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface Sale {
  id: number;
  invoiceNo: string;
  customerId: number;
  customerName: string;
  date: string;
  lineItems: SaleLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "paid" | "unpaid" | "partially_paid";
}

let sales: Sale[] = [
  {
    id: 1,
    invoiceNo: "INV-001",
    customerId: 1,
    customerName: "John's Seafood Restaurant",
    date: "2025-01-20",
    lineItems: [
      { productId: 1, productName: "Atlantic Salmon", quantity: 50, price: 12.50, total: 625 },
      { productId: 2, productName: "Tuna Steaks", quantity: 30, price: 18.00, total: 540 },
    ],
    subtotal: 1165,
    tax: 116.50,
    total: 1281.50,
    status: "paid",
  },
  {
    id: 2,
    invoiceNo: "INV-002",
    customerId: 2,
    customerName: "Marina Fish Market",
    date: "2025-01-22",
    lineItems: [
      { productId: 3, productName: "King Prawns", quantity: 20, price: 22.00, total: 440 },
    ],
    subtotal: 440,
    tax: 44.00,
    total: 484.00,
    status: "unpaid",
  },
  {
    id: 3,
    invoiceNo: "INV-003",
    customerId: 3,
    customerName: "Coastal Bistro",
    date: "2025-01-25",
    lineItems: [
      { productId: 1, productName: "Atlantic Salmon", quantity: 40, price: 12.50, total: 500 },
      { productId: 4, productName: "Sea Bass", quantity: 25, price: 15.00, total: 375 },
    ],
    subtotal: 875,
    tax: 87.50,
    total: 962.50,
    status: "partially_paid",
  },
  {
    id: 4,
    invoiceNo: "INV-004",
    customerId: 4,
    customerName: "Harbor View Hotel",
    date: "2025-01-28",
    lineItems: [
      { productId: 2, productName: "Tuna Steaks", quantity: 60, price: 18.00, total: 1080 },
      { productId: 3, productName: "King Prawns", quantity: 40, price: 22.00, total: 880 },
    ],
    subtotal: 1960,
    tax: 196.00,
    total: 2156.00,
    status: "paid",
  },
  {
    id: 5,
    invoiceNo: "INV-005",
    customerId: 5,
    customerName: "Ocean Breeze Cafe",
    date: "2025-01-30",
    lineItems: [
      { productId: 4, productName: "Sea Bass", quantity: 35, price: 15.00, total: 525 },
    ],
    subtotal: 525,
    tax: 52.50,
    total: 577.50,
    status: "unpaid",
  },
];

export async function GET() {
  return NextResponse.json(sales);
}

export async function POST(req: Request) {
  const body = await req.json();
  const newSale: Sale = {
    id: Math.max(0, ...sales.map(s => s.id)) + 1,
    invoiceNo: body.invoiceNo || `INV-${String(sales.length + 1).padStart(3, "0")}`,
    customerId: body.customerId,
    customerName: body.customerName,
    date: body.date,
    lineItems: body.lineItems,
    subtotal: body.subtotal,
    tax: body.tax,
    total: body.total,
    status: body.status || "unpaid",
  };
  sales = [newSale, ...sales];
  return NextResponse.json(newSale, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const index = sales.findIndex(s => s.id === body.id);
  if (index === -1) return NextResponse.json({ error: "Sale not found" }, { status: 404 });
  sales[index] = { ...sales[index], ...body };
  return NextResponse.json(sales[index]);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  sales = sales.filter(s => s.id !== parseInt(id));
  return NextResponse.json({ success: true });
}