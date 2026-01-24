import { NextRequest, NextResponse } from 'next/server';
import { checkServiceability } from '@/src/lib/shiprocket';
import { getShiprocketPickupLocations } from '@/src/lib/shiprocket';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      deliveryPincode, 
      weight,
      cod = 0,
      codType = 'Prepaid'
    } = body;

    // Get Shiprocket token from environment or try to authenticate
    let token: string | null = null;
    
    // Try to get token from environment (if stored there)
    const shiprocketEmail = process.env.SHIPROCKET_EMAIL;
    const shiprocketPassword = process.env.SHIPROCKET_PASSWORD;
    
    if (shiprocketEmail && shiprocketPassword) {
      try {
        // Get token by authenticating
        const authResponse = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: shiprocketEmail,
            password: shiprocketPassword,
          }),
        });
        
        if (authResponse.ok) {
          const authData = await authResponse.json();
          token = authData.token;
        }
      } catch (error) {
        console.error('Error getting Shiprocket token:', error);
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Shiprocket not configured. Please configure Shiprocket credentials in admin settings.' },
        { status: 401 }
      );
    }

    if (!deliveryPincode || !weight) {
      return NextResponse.json(
        { error: 'Delivery pincode and weight are required' },
        { status: 400 }
      );
    }

    // Get pickup locations to find the Primary location pincode
    let pickupPincode: string | null = null;
    try {
      const locations = await getShiprocketPickupLocations(token);
      
      // Find Primary pickup location
      if (locations.data && Array.isArray(locations.data)) {
        const primaryLocation = locations.data.find(
          (loc: any) => loc.name === 'Primary' || loc.is_default === 1 || loc.is_default === true
        );
        
        if (primaryLocation) {
          pickupPincode = primaryLocation.pincode || primaryLocation.postcode;
        } else if (locations.data.length > 0) {
          // Use first location if Primary not found
          pickupPincode = locations.data[0].pincode || locations.data[0].postcode;
        }
      }
    } catch (error) {
      console.error('Error fetching pickup locations:', error);
      // Continue with fallback
    }

    if (!pickupPincode) {
      return NextResponse.json(
        { error: 'Could not determine pickup location pincode. Please configure Shiprocket pickup location.' },
        { status: 400 }
      );
    }

    // Calculate shipping cost using Shiprocket serviceability API
    const serviceabilityResult = await checkServiceability(token, {
      pickup_postcode: pickupPincode,
      delivery_postcode: deliveryPincode,
      weight: parseFloat(weight.toString()),
      cod: cod,
      cod_type: codType,
    });

    if (!serviceabilityResult || !serviceabilityResult.data) {
      return NextResponse.json(
        { error: 'No shipping options available for this address' },
        { status: 404 }
      );
    }

    const availableCouriers = serviceabilityResult.data.available_courier_companies || [];
    
    if (availableCouriers.length === 0) {
      return NextResponse.json(
        { error: 'No courier service available for this route' },
        { status: 404 }
      );
    }

    // Get the cheapest shipping option
    const cheapestOption = availableCouriers.reduce((min: any, current: any) => {
      return (current.rate || 0) < (min.rate || Infinity) ? current : min;
    }, availableCouriers[0]);

    return NextResponse.json({
      success: true,
      shippingCost: cheapestOption.rate || 0,
      courierName: cheapestOption.courier_name || 'Standard',
      estimatedDays: cheapestOption.estimated_delivery_days || '3-5',
      pickupPincode,
      deliveryPincode,
      availableOptions: availableCouriers.map((courier: any) => ({
        courierName: courier.courier_name,
        rate: courier.rate,
        estimatedDays: courier.estimated_delivery_days,
      })),
    });
  } catch (error: any) {
    console.error('Shipping calculation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate shipping cost' },
      { status: 500 }
    );
  }
}
