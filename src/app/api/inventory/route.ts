import { NextResponse } from "next/server";

let seed = [
  { id: 1, name: "Atlantic Salmon", type: "fresh", pricePerKg: 12.5, stockKg: 420, availability: "in_stock" },
  { id: 2, name: "Pacific Cod", type: "frozen", pricePerKg: 8.2, stockKg: 90, availability: "low_stock" },
  { id: 3, name: "Tuna (Yellowfin)", type: "fresh", pricePerKg: 15.0, stockKg: 0, availability: "out_of_stock" },
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
  const idx = seed.findIndex(item => item.id === body.id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  seed[idx] = { ...seed[idx], ...body };
  return NextResponse.json(seed[idx]);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  const idx = seed.findIndex(item => item.id === id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const deleted = seed.splice(idx, 1)[0];
  return NextResponse.json(deleted);
}