import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    email: process.env.SHIPROCKET_EMAIL || "missing",
    password: process.env.SHIPROCKET_PASSWORD || "missing"
  });
}
