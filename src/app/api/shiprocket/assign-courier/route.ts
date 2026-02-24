import { NextRequest, NextResponse } from "next/server";
import { assignCourierAndGenerateAWB } from "@/src/lib/shiprocket";

export async function POST(request: NextRequest) {
  try {
    const { token, ...assignData } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Shiprocket token is required" },
        { status: 401 }
      );
    }

    const result = await assignCourierAndGenerateAWB(token, assignData);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to assign courier" },
        { status: 500 }
      );
    }

    // Save AWB to order in database immediately
    if (result && (result.awb_assign_status === 1 || result.response?.data?.awb_assign_status === 1)) {
       const awbCode = result.response?.data?.awb_code || result.awb_code;
       // We need the order reference to update it. If `assignData` has the order_id, we use it.
       // Otherwise, we might need to look it up by shiprocket_shipment_id.
       if (awbCode) {
           try {
             const { createAdminClient } = await import("@/src/lib/supabase/server");
             const supabase = createAdminClient();

             // First try if order_id was passed in assignData
             if (assignData.order_id) {
                 const ourRef = String(assignData.order_id).trim();
                 const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ourRef);
                 const updates: any = { tracking_number: awbCode };
                 if (isUuid) {
                   await supabase.from("orders").update(updates).eq("id", ourRef);
                 } else {
                   await supabase.from("orders").update(updates).eq("order_number", ourRef);
                 }
                 console.log(`Saved AWB ${awbCode} to order ${ourRef} from manual assign`);
             } else if (assignData.shipment_id) {
                 // Fallback: update by shiprocket_shipment_id
                 const updates: any = { tracking_number: awbCode };
                 await supabase.from("orders").update(updates).eq("shiprocket_shipment_id", assignData.shipment_id);
                 console.log(`Saved AWB ${awbCode} to order with shipment ID ${assignData.shipment_id} from manual assign`);
             }
           } catch (e) {
               console.error("Failed to save AWB to database during manual assign:", e);
           }
       }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Assign courier error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
