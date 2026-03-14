import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useRecentDrills(limit: number = 100) {
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  return useQuery({
    queryKey: ["recent-drills", safeLimit],
    queryFn: () => api.getRecentDrills(safeLimit),
    staleTime: 2 * 60 * 1000,
  });
}
