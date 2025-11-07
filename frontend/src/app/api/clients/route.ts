import { NextResponse } from "next/server";

let seed = [
  { id: 1, name: "Blue Harbor Co.", email: "orders@blueharbor.example", phone: "+1 (555) 201-4488", address: "12 Dockside Rd, Portland, ME" },
  { id: 2, name: "Seaside Market", email: "contact@seasidemarket.example", phone: "+1 (555) 334-9921", address: "77 Ocean Ave, Santa Cruz, CA" },
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
  const idx = seed.findIndex(client => client.id === body.id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  seed[idx] = { ...seed[idx], ...body };
  return NextResponse.json(seed[idx]);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  const idx = seed.findIndex(client => client.id === id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const deleted = seed.splice(idx, 1)[0];
  return NextResponse.json(deleted);
}