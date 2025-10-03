import { NextResponse } from "next/server";

let seed = [
  { id: 1, name: "Atlantic Salmon", category: "Fresh Fish", price: 12.5, unit: "kg", stock: 420 },
  { id: 2, name: "Pacific Cod", category: "Frozen Fish", price: 8.2, unit: "kg", stock: 90 },
  { id: 3, name: "Tuna (Yellowfin)", category: "Fresh Fish", price: 15.0, unit: "kg", stock: 200 },
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
  const idx = seed.findIndex(product => product.id === body.id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  seed[idx] = { ...seed[idx], ...body };
  return NextResponse.json(seed[idx]);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  const idx = seed.findIndex(product => product.id === id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const deleted = seed.splice(idx, 1)[0];
  return NextResponse.json(deleted);
}