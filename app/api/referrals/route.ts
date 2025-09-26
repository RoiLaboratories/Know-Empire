import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { referral_tracking } from "@/schema/referral.schema";
import { and, count, eq, sum } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const fid = req.headers.get("fid");

  if (!fid) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Get total referrals count and total points
    const stats = await db
      .select({
        total_referrals: count(referral_tracking.id),
        total_points: sum(referral_tracking.points_earned),
      })
      .from(referral_tracking)
      .where(eq(referral_tracking.referrer_fid, fid));

    return NextResponse.json({
      referrals: stats[0].total_referrals || 0,
      points: stats[0].total_points || 0,
    });
  } catch (error) {
    console.error("Error fetching referral stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral stats" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const fid = req.headers.get("fid");
  if (!fid) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { referrer_fid, referred_fid } = await req.json();

    // Check if this referral already exists
    const existing = await db
      .select()
      .from(referral_tracking)
      .where(
        and(
          eq(referral_tracking.referrer_fid, referrer_fid),
          eq(referral_tracking.referred_fid, referred_fid)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Referral already recorded" },
        { status: 400 }
      );
    }

    // Record new referral
    await db.insert(referral_tracking).values({
      id: crypto.randomUUID(),
      referrer_fid,
      referred_fid,
      points_earned: 100,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error recording referral:", error);
    return NextResponse.json(
      { error: "Failed to record referral" },
      { status: 500 }
    );
  }
}