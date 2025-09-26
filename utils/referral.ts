import { db } from "@/db";
import { referral_tracking } from "@/schema/referral.schema";

export async function recordReferral(referrer_fid: string, referred_fid: string) {
  try {
    await fetch("/api/referrals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        fid: referred_fid,
      },
      body: JSON.stringify({
        referrer_fid,
        referred_fid,
      }),
    });

    return true;
  } catch (error) {
    console.error("Failed to record referral:", error);
    return false;
  }
}