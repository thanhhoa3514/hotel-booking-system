import { useQuery } from '@tanstack/react-query';
import { rolesApi } from '@/services/roles.api';

export const roleKeys = {
  all: ['roles'] as const,
};

/**
 * Get all roles
 * Cached for 5 minutes since roles rarely change
 */
export function useRoles() {
  return useQuery({
    queryKey: roleKeys.all,
    queryFn: () => rolesApi.getRoles(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
