import { useQuery } from "@tanstack/react-query";
import { checkHealth } from "./api";

export function useBackendStatus() {
  const q = useQuery({
    queryKey: ["clauseiq-health"],
    queryFn: checkHealth,
    refetchInterval: 30_000,
    retry: false,
    staleTime: 15_000,
  });
  return {
    checking: q.isPending,
    online: q.data === true,
    refresh: () => q.refetch(),
  };
}
