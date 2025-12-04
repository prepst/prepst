import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useMockExams() {
  return useQuery({
    queryKey: ["mock-exams"], // We might want to add this to queryKeys in lib/query-keys.ts later
    queryFn: () => api.getMockExams(),
  });
}
