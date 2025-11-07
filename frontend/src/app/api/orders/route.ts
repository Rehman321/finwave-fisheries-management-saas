import { NextResponse } from "next/server";

let seed = [
  { id: 1, clientName: "Blue Harbor Co.", fishName: "Atlantic Salmon", quantityKg: 120, pricePerKg: 12.5, status: "processing", createdAt: new Date(Date.now()-86400000).toISOString() },
  { id: 2, clientName: "Seaside Market", fishName: "Pacific Cod", quantityKg: 60, pricePerKg: 8.2, status: "pending", createdAt: new Date().toISOString() },
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
  const idx = seed.findIndex(order => order.id === body.id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  seed[idx] = { ...seed[idx], ...body };
  return NextResponse.json(seed[idx]);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  const idx = seed.findIndex(order => order.id === id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const deleted = seed.splice(idx, 1)[0];
  return NextResponse.json(deleted);
}