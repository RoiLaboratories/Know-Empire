import { sql } from "drizzle-orm";
import { pgTable, text, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const referral_tracking = pgTable("referral_tracking", {
  id: text("id").primaryKey(),
  referrer_fid: text("referrer_fid").notNull(),
  referred_fid: text("referred_fid").notNull(),
  points_earned: integer("points_earned").notNull().default(100),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    referralUnique: uniqueIndex('referral_unique_idx').on(table.referrer_fid, table.referred_fid),
  }
});

// Types for type-safety
export type ReferralTracking = typeof referral_tracking.$inferSelect;
export type NewReferralTracking = typeof referral_tracking.$inferInsert;