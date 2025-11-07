import { NextResponse } from "next/server";

let seed = [
  { id: 1, name: "Sales Tax", rate: 8.5, type: "Output", description: "Standard sales tax" },
  { id: 2, name: "VAT", rate: 15.0, type: "Output", description: "Value Added Tax" },
  { id: 3, name: "Import Duty", rate: 5.0, type: "Input", description: "Import tax on goods" },
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
  const idx = seed.findIndex(tax => tax.id === body.id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  seed[idx] = { ...seed[idx], ...body };
  return NextResponse.json(seed[idx]);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  const idx = seed.findIndex(tax => tax.id === id);
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const deleted = seed.splice(idx, 1)[0];
  return NextResponse.json(deleted);
}