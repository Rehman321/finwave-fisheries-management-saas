import { NextResponse } from "next/server";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  outstandingBalance: number;
}

let customers: Customer[] = [
  { id: 1, name: "John's Seafood Restaurant", email: "john@seafood.com", phone: "555-0101", address: "123 Harbor St", outstandingBalance: 2500 },
  { id: 2, name: "Marina Fish Market", email: "marina@fishmarket.com", phone: "555-0102", address: "456 Ocean Ave", outstandingBalance: 0 },
  { id: 3, name: "Coastal Bistro", email: "info@coastalbistro.com", phone: "555-0103", address: "789 Beach Rd", outstandingBalance: 1200 },
  { id: 4, name: "Harbor View Hotel", email: "purchasing@harborview.com", phone: "555-0104", address: "321 Port Blvd", outstandingBalance: 4500 },
  { id: 5, name: "Ocean Breeze Cafe", email: "orders@oceanbreeze.com", phone: "555-0105", address: "654 Seaside Dr", outstandingBalance: 800 },
  { id: 6, name: "Fresh Catch Deli", email: "deli@freshcatch.com", phone: "555-0106", address: "987 Marine Pkwy", outstandingBalance: 0 },
  { id: 7, name: "Blue Wave Restaurant", email: "contact@bluewave.com", phone: "555-0107", address: "147 Pier St", outstandingBalance: 3200 },
  { id: 8, name: "Seaside Grill", email: "manager@seasidegrill.com", phone: "555-0108", address: "258 Wharf Ln", outstandingBalance: 1500 },
];

export async function GET() {
  return NextResponse.json(customers);
}

export async function POST(req: Request) {
  const body = await req.json();
  customers = [body, ...customers];
  return NextResponse.json(body, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const idx = customers.findIndex(customer => customer.id === body.id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  customers[idx] = { ...customers[idx], ...body };
  return NextResponse.json(customers[idx]);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  const idx = customers.findIndex(customer => customer.id === id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const deleted = customers.splice(idx, 1)[0];
  return NextResponse.json(deleted);
}