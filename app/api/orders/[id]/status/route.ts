import { NextResponse } from "next/server";
import { createServiceClient } from "../../../../../utils/supabase";
import { generateTrackingId, isValidTrackingId } from "../../../../../utils/tracking";

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { status, tracking_number } = await request.json();
    const supabase = createServiceClient();

    // Validate status
    if (!["pending", "shipped", "delivered", "cancelled"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // If marking as shipped and no tracking number provided, generate one
    const updates: Record<string, any> = { status };
    if (status === "shipped") {
      if (!tracking_number) {
        updates.tracking_number = generateTrackingId();
      } else if (!isValidTrackingId(tracking_number)) {
        return NextResponse.json(
          { error: "Invalid tracking number format" },
          { status: 400 }
        );
      } else {
        updates.tracking_number = tracking_number;
      }
      updates.shipped_at = new Date().toISOString();
    } else if (status === "delivered") {
      updates.delivered_at = new Date().toISOString();
    }

    const { data: order, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", context.params.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating order status:", error);
      return NextResponse.json(
        { error: "Failed to update order status" },
        { status: 500 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error in PATCH /api/orders/[id]/status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
