/**
 * React Query hooks for options paper trading.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getOptionsPaperOrders,
  getOptionsPaperPositions,
  placeOptionsPaperOrder,
  type PlaceOptionsPaperOrderRequest,
} from '@/lib/api/options-paper';

// ============================================================================
// Query key factory
// ============================================================================

export const optionsPaperQueryKeys = {
  all: ['options', 'paper'] as const,
  positions: (status: string) =>
    [...optionsPaperQueryKeys.all, 'positions', status] as const,
  orders: () => [...optionsPaperQueryKeys.all, 'orders'] as const,
};

// ============================================================================
// Hooks
// ============================================================================

export function useOptionsPaperPositions(
  status: 'open' | 'closed' | 'expired' = 'open',
) {
  return useQuery({
    queryKey: optionsPaperQueryKeys.positions(status),
    queryFn: () => getOptionsPaperPositions(status),
    staleTime: 60 * 1000, // 1 minute — mark prices are simulated, no need to hammer
    retry: 1,
  });
}

export function useOptionsPaperOrders(limit = 50) {
  return useQuery({
    queryKey: optionsPaperQueryKeys.orders(),
    queryFn: () => getOptionsPaperOrders(limit),
    staleTime: 30 * 1000,
    retry: 1,
  });
}

export function usePlaceOptionsPaperOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: PlaceOptionsPaperOrderRequest) =>
      placeOptionsPaperOrder(request),
    onSuccess: () => {
      // Invalidate positions and orders to reflect the new state
      queryClient.invalidateQueries({ queryKey: optionsPaperQueryKeys.all });
      // Also invalidate the paper account balance (shared cash)
      queryClient.invalidateQueries({ queryKey: ['paper'] });
    },
  });
}
