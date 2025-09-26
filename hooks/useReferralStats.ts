import { useCallback, useEffect, useState } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";

interface ReferralStats {
  referrals: number;
  points: number;
}

export function useReferralStats() {
  const { context } = useMiniKit();
  const fid = context?.user?.fid;
  const [stats, setStats] = useState<ReferralStats>({
    referrals: 0,
    points: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!fid) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/referrals", {
        headers: {
          fid: fid.toString(),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch referral stats");
      }

      const data = await response.json();
      setStats({
        referrals: data.referrals,
        points: data.points,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  }, [fid]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}