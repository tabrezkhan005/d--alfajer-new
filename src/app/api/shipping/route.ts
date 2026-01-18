import { NextRequest, NextResponse } from 'next/server';

// Envia API Configuration - Using Sandbox by default for testing
const ENVIA_API_URL = process.env.ENVIA_API_URL || 'https://api-test.envia.com';
const ENVIA_API_KEY = process.env.ENVIA_API_KEY || '';

// POST: Get shipping rates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      origin,
      destination,
      packages
    } = body;

    if (!ENVIA_API_KEY) {
      // Return mock rates if Envia not configured
      return NextResponse.json({
        success: true,
        rates: [
          {
            carrier: 'Standard Shipping',
            service: 'Ground',
            price: 50,
            currency: 'INR',
            estimatedDays: 5,
          },
          {
            carrier: 'Express Shipping',
            service: 'Express',
            price: 150,
            currency: 'INR',
            estimatedDays: 2,
          },
          {
            carrier: 'Overnight',
            service: 'Priority',
            price: 300,
            currency: 'INR',
            estimatedDays: 1,
          },
        ],
        message: 'Mock rates - Envia not configured',
      });
    }

    // Call Envia API for rates
    const response = await fetch(`${ENVIA_API_URL}/ship/rate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ENVIA_API_KEY}`,
      },
      body: JSON.stringify({
        origin: {
          name: origin.name || 'Sender',
          company: origin.company || '',
          email: origin.email || '',
          phone: origin.phone || '',
          street: origin.street || '',
          number: origin.number || '',
          district: origin.district || '',
          city: origin.city || '',
          state: origin.state || '',
          country: origin.country || 'IN',
          postalCode: origin.postalCode || '',
        },
        destination: {
          name: destination.name || 'Receiver',
          company: destination.company || '',
          email: destination.email || '',
          phone: destination.phone || '',
          street: destination.street || '',
          number: destination.number || '',
          district: destination.district || '',
          city: destination.city || '',
          state: destination.state || '',
          country: destination.country || 'IN',
          postalCode: destination.postalCode || '',
        },
        packages: packages.map((pkg: any) => ({
          content: pkg.content || 'Products',
          amount: pkg.amount || 1,
          type: pkg.type || 'box',
          weight: pkg.weight || 1,
          insurance: pkg.insurance || 0,
          declaredValue: pkg.declaredValue || 0,
          weightUnit: 'KG',
          lengthUnit: 'CM',
          dimensions: {
            length: pkg.length || 10,
            width: pkg.width || 10,
            height: pkg.height || 10,
          },
        })),
        shipment: {
          carrier: 'all',
        },
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message || 'Failed to get shipping rates' },
        { status: 400 }
      );
    }

    // Transform Envia response to our format
    const rates = (data.data || []).map((rate: any) => ({
      carrier: rate.carrier_name || rate.carrier,
      service: rate.service_name || rate.service,
      price: rate.total_price || rate.price,
      currency: rate.currency || 'INR',
      estimatedDays: rate.days || 5,
      rateId: rate.rate_id,
    }));

    return NextResponse.json({
      success: true,
      rates,
    });
  } catch (error) {
    console.error('Envia rate error:', error);
    return NextResponse.json(
      { error: 'Failed to get shipping rates' },
      { status: 500 }
    );
  }
}

// PUT: Create shipment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      rateId,
      origin,
      destination,
      packages
    } = body;

    if (!ENVIA_API_KEY) {
      // Return mock shipment if Envia not configured
      const trackingNumber = `TRACK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      return NextResponse.json({
        success: true,
        shipment: {
          trackingNumber,
          carrier: 'Standard Shipping',
          labelUrl: null,
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        message: 'Mock shipment - Envia not configured',
      });
    }

    // Call Envia API to create shipment
    const response = await fetch(`${ENVIA_API_URL}/ship/generate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ENVIA_API_KEY}`,
      },
      body: JSON.stringify({
        rate_id: rateId,
        origin,
        destination,
        packages,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message || 'Failed to create shipment' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      shipment: {
        trackingNumber: data.tracking_number || data.trackingNumber,
        carrier: data.carrier,
        labelUrl: data.label_url || data.labelUrl,
        estimatedDelivery: data.estimated_delivery,
        shipmentId: data.shipment_id || data.id,
      },
    });
  } catch (error) {
    console.error('Envia shipment error:', error);
    return NextResponse.json(
      { error: 'Failed to create shipment' },
      { status: 500 }
    );
  }
}

// GET: Track shipment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get('trackingNumber');
    const carrier = searchParams.get('carrier');

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number is required' },
        { status: 400 }
      );
    }

    if (!ENVIA_API_KEY) {
      // Return mock tracking if Envia not configured
      return NextResponse.json({
        success: true,
        tracking: {
          trackingNumber,
          status: 'in_transit',
          events: [
            {
              date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              description: 'Package picked up',
              location: 'Origin City',
            },
            {
              date: new Date().toISOString(),
              description: 'Package in transit',
              location: 'Transit Hub',
            },
          ],
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        message: 'Mock tracking - Envia not configured',
      });
    }

    // Call Envia API to track shipment
    const response = await fetch(
      `${ENVIA_API_URL}/ship/tracking/?trackingNumber=${trackingNumber}&carrier=${carrier || ''}`,
      {
        headers: {
          'Authorization': `Bearer ${ENVIA_API_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message || 'Failed to track shipment' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      tracking: {
        trackingNumber: data.tracking_number,
        status: data.status,
        events: data.checkpoints || data.events || [],
        estimatedDelivery: data.estimated_delivery,
      },
    });
  } catch (error) {
    console.error('Envia tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track shipment' },
      { status: 500 }
    );
  }
}
