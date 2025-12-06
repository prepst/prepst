import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useStudyTime(daysBack: number = 7) {
  return useQuery({
    queryKey: ["study-time", daysBack],
    queryFn: () => api.getStudyTime(daysBack),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
