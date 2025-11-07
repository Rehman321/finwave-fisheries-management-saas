import { NextResponse } from "next/server";

const reports = [
  { id: 1, name: "Sales Report", type: "Sales", period: "Monthly", generatedAt: new Date().toISOString() },
  { id: 2, name: "Inventory Report", type: "Inventory", period: "Weekly", generatedAt: new Date().toISOString() },
  { id: 3, name: "Financial Report", type: "Financial", period: "Quarterly", generatedAt: new Date().toISOString() },
];

export async function GET() {
  return NextResponse.json(reports);
}

export async function POST(req: Request) {
  const body = await req.json();
  const newReport = { id: Date.now(), ...body, generatedAt: new Date().toISOString() };
  return NextResponse.json(newReport);
}