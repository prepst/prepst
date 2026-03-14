import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { components } from "@/lib/types/api.generated";

type DiagnosticTestListResponse =
  components["schemas"]["DiagnosticTestListResponse"];

export function useDiagnosticTests() {
  return useQuery({
    queryKey: ["diagnostic-tests"],
    queryFn: () =>
      api.get("/api/diagnostic-test/") as Promise<DiagnosticTestListResponse>,
    staleTime: 5 * 60 * 1000,
  });
}
