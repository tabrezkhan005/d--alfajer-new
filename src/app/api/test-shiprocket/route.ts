import { NextRequest, NextResponse } from 'next/server';
import { automateShiprocketShipment } from '@/src/lib/shiprocket-automation';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: 'orderId missing' }, { status: 400 });
  }

  try {
    const result = await automateShiprocketShipment(orderId);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
