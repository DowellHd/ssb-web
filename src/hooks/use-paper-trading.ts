/**
 * React Query hooks for paper trading.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getAccount,
  getTierLimits,
  listOrders,
  listPositions,
  getPerformance,
  placeOrder,
  cancelOrder,
  type Account,
  type TierLimits,
  type OrdersListResponse,
  type PositionsListResponse,
  type Performance,
  type PlaceOrderRequest,
  type Order,
} from '@/lib/api/paper';
import { getErrorMessage } from '@/lib/api-client';

// Query keys
export const paperQueryKeys = {
  all: ['paper'] as const,
  account: () => [...paperQueryKeys.all, 'account'] as const,
  limits: () => [...paperQueryKeys.all, 'limits'] as const,
  orders: (status?: string) => [...paperQueryKeys.all, 'orders', { status }] as const,
  positions: () => [...paperQueryKeys.all, 'positions'] as const,
  performance: (period: string) => [...paperQueryKeys.all, 'performance', period] as const,
};

/**
 * Hook to get paper trading account.
 */
export function useAccount() {
  return useQuery<Account>({
    queryKey: paperQueryKeys.account(),
    queryFn: getAccount,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to get tier-based limits.
 */
export function useTierLimits() {
  return useQuery<TierLimits>({
    queryKey: paperQueryKeys.limits(),
    queryFn: getTierLimits,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to list orders.
 */
export function useOrders(status?: string) {
  return useQuery<OrdersListResponse>({
    queryKey: paperQueryKeys.orders(status),
    queryFn: () => listOrders({ status }),
    staleTime: 10 * 1000, // 10 seconds
  });
}

/**
 * Hook to list positions.
 */
export function usePositions() {
  return useQuery<PositionsListResponse>({
    queryKey: paperQueryKeys.positions(),
    queryFn: listPositions,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to get performance metrics.
 */
export function usePerformance(period: string = '1m') {
  return useQuery<Performance>({
    queryKey: paperQueryKeys.performance(period),
    queryFn: () => getPerformance(period),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to place an order.
 */
export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation<Order, Error, PlaceOrderRequest>({
    mutationFn: placeOrder,
    onSuccess: (order) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: paperQueryKeys.account() });
      queryClient.invalidateQueries({ queryKey: paperQueryKeys.positions() });
      queryClient.invalidateQueries({ queryKey: paperQueryKeys.orders() });
      queryClient.invalidateQueries({ queryKey: paperQueryKeys.limits() });

      toast.success(`Order placed: ${order.side.toUpperCase()} ${order.quantity} ${order.symbol}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/**
 * Hook to cancel an order.
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: cancelOrder,
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: paperQueryKeys.orders() });
      queryClient.invalidateQueries({ queryKey: paperQueryKeys.limits() });

      toast.success('Order canceled');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
