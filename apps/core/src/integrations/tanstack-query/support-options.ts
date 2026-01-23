import {
  contactsQuery,
  recentTicketsQuery,
  ticketsQuery,
  ticketStatsQuery,
} from "@/core/functions/support";

export function ticketStatsQueryOptions() {
  return {
    queryKey: ["support", "stats"],
    queryFn: () => ticketStatsQuery({ data: {} }),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: 2,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 10000),
  };
}

export function recentTicketsQueryOptions(limit: number = 5) {
  return {
    queryKey: ["support", "tickets", "recent", limit],
    queryFn: () => recentTicketsQuery({ data: { limit } }),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    retry: 2,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 10000),
  };
}

export function ticketsQueryOptions(filters: Record<string, unknown> = {}) {
  return {
    queryKey: ["support", "tickets", filters],
    queryFn: () => ticketsQuery({ data: filters }),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    retry: 2,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 10000),
  };
}

export function contactsQueryOptions() {
  return {
    queryKey: ["support", "contacts"],
    queryFn: () => contactsQuery({ data: {} }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 10000),
  };
}

export const supportQueries = {
  stats: ticketStatsQueryOptions,
  tickets: ticketsQueryOptions,
  recentTickets: recentTicketsQueryOptions,
  contacts: contactsQueryOptions,
};
