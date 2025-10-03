import { NextResponse } from "next/server";

interface Supplier {
  id: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  balance: number;
}

let suppliers: Supplier[] = [
  { id: 1, companyName: "Ocean Fresh Suppliers", contactPerson: "Michael Chen", email: "michael@oceanfresh.com", phone: "555-0201", address: "789 Dock St", balance: 5000 },
  { id: 2, companyName: "Marine Wholesale Ltd", contactPerson: "Sarah Johnson", email: "sarah@marinewholesale.com", phone: "555-0202", address: "321 Port Ave", balance: 0 },
  { id: 3, companyName: "Coastal Fish Market", contactPerson: "David Lee", email: "david@coastalfish.com", phone: "555-0203", address: "654 Harbor Rd", balance: 2500 },
  { id: 4, companyName: "Deep Sea Trading", contactPerson: "Emma Wilson", email: "emma@deepseatrading.com", phone: "555-0204", address: "147 Marina Blvd", balance: 8000 },
  { id: 5, companyName: "Pacific Catch Co", contactPerson: "James Brown", email: "james@pacificcatch.com", phone: "555-0205", address: "258 Pier Ln", balance: 1200 },
  { id: 6, companyName: "Atlantic Seafood Inc", contactPerson: "Lisa Martinez", email: "lisa@atlanticseafood.com", phone: "555-0206", address: "369 Wharf Dr", balance: 0 },
  { id: 7, companyName: "Northern Waters Supply", contactPerson: "Robert Taylor", email: "robert@northernwaters.com", phone: "555-0207", address: "741 Bay St", balance: 3500 },
  { id: 8, companyName: "Global Fish Imports", contactPerson: "Jennifer Davis", email: "jennifer@globalfish.com", phone: "555-0208", address: "852 Coast Pkwy", balance: 6200 },
];

export async function GET() {
  return NextResponse.json(suppliers);
}

export async function POST(req: Request) {
  const body = await req.json();
  suppliers = [body, ...suppliers];
  return NextResponse.json(body, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const idx = suppliers.findIndex(supplier => supplier.id === body.id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  suppliers[idx] = { ...suppliers[idx], ...body };
  return NextResponse.json(suppliers[idx]);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  const idx = suppliers.findIndex(supplier => supplier.id === id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const deleted = suppliers.splice(idx, 1)[0];
  return NextResponse.json(deleted);
}